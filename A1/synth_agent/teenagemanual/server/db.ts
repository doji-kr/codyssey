import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, devices, guides, guideSteps, faqs, deviceControls, chatHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Device queries
 */
export async function getAllDevices() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(devices).orderBy(devices.sortOrder);
}

export async function getDeviceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(devices).where(eq(devices.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDeviceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Guide queries
 */
export async function getGuidesByDeviceId(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(guides)
    .where(eq(guides.deviceId, deviceId))
    .orderBy(guides.sortOrder);
}

export async function getGuideBySlug(deviceId: number, slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(guides)
    .where(and(eq(guides.deviceId, deviceId), eq(guides.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGuideById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Guide steps queries
 */
export async function getGuideStepsByGuideId(guideId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(guideSteps)
    .where(eq(guideSteps.guideId, guideId))
    .orderBy(guideSteps.stepNumber);
}

/**
 * FAQ queries
 */
export async function getFAQsByDeviceId(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(faqs)
    .where(eq(faqs.deviceId, deviceId))
    .orderBy(faqs.sortOrder);
}

/**
 * Device controls queries
 */
export async function getDeviceControlsByDeviceId(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(deviceControls)
    .where(eq(deviceControls.deviceId, deviceId))
    .orderBy(deviceControls.sortOrder);
}

export async function getDeviceControlById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(deviceControls).where(eq(deviceControls.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Chat history queries
 */
export async function saveChatMessage(userId: number | null, deviceId: number, userMessage: string, assistantMessage: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(chatHistory).values({
    userId,
    deviceId,
    userMessage,
    assistantMessage,
  });
}

export async function getChatHistoryByDeviceId(deviceId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(chatHistory)
    .where(eq(chatHistory.deviceId, deviceId))
    .orderBy(chatHistory.createdAt)
    .limit(limit);
}

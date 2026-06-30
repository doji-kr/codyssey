import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Devices table - Teenage Engineering devices
 * Stores information about each supported device (K.O. II, OP-1F, etc.)
 */
export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // ep-133, op-1f, etc.
  name: varchar("name", { length: 128 }).notNull(), // K.O. II, OP-1 Field, etc.
  displayName: varchar("displayName", { length: 128 }).notNull(), // EP–133, OP–1F, etc.
  category: varchar("category", { length: 64 }).notNull(), // sampler, synthesizer, mixer, etc.
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 256 }), // 64 mb sampler composer
  imageUrl: varchar("imageUrl", { length: 512 }),
  diagramImageUrl: varchar("diagramImageUrl", { length: 512 }), // Interactive diagram image
  controlsData: json("controlsData"), // Array of control points for interactive diagram
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;

/**
 * Guides table - Step-by-step learning guides for each device
 * Includes "Mastery" tracks and general how-to guides
 */
export const guides = mysqlTable("guides", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["mastery", "guide", "workflow"]).default("guide").notNull(),
  isFree: boolean("isFree").default(true), // Free guides vs Pro-only tracks
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guide = typeof guides.$inferSelect;
export type InsertGuide = typeof guides.$inferInsert;

/**
 * Guide steps - Individual steps within a guide
 * Each step contains instructions and related control information
 */
export const guideSteps = mysqlTable("guideSteps", {
  id: int("id").autoincrement().primaryKey(),
  guideId: int("guideId").notNull(),
  stepNumber: int("stepNumber").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"), // Markdown content
  relatedControls: json("relatedControls"), // Array of control IDs to highlight
  tips: text("tips"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuideStep = typeof guideSteps.$inferSelect;
export type InsertGuideStep = typeof guideSteps.$inferInsert;

/**
 * FAQs table - Frequently asked questions for each device
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  question: varchar("question", { length: 512 }).notNull(),
  answer: text("answer"), // Markdown content
  relatedControls: json("relatedControls"), // Array of control IDs
  category: varchar("category", { length: 64 }), // sampling, sequencing, effects, etc.
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

/**
 * Device controls - Interactive control points on device diagrams
 * Each control has a position, name, and description for tooltips
 */
export const deviceControls = mysqlTable("deviceControls", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  controlId: varchar("controlId", { length: 64 }).notNull(), // pad-1, knob-x, etc.
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  positionX: int("positionX"), // Percentage or pixel position
  positionY: int("positionY"),
  width: int("width"),
  height: int("height"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeviceControl = typeof deviceControls.$inferSelect;
export type InsertDeviceControl = typeof deviceControls.$inferInsert;

/**
 * Chat history - Store user chat interactions for context and analytics
 */
export const chatHistory = mysqlTable("chatHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  deviceId: int("deviceId").notNull(),
  userMessage: text("userMessage").notNull(),
  assistantMessage: text("assistantMessage").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

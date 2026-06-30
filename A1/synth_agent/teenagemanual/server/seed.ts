import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { devices, guides, guideSteps, faqs, deviceControls } from "../drizzle/schema";
import { DEVICES_DATA, GUIDES_DATA, GUIDE_STEPS_DATA, FAQS_DATA, DEVICE_CONTROLS_DATA } from "./seed-data";

async function seed() {
  const connection = await createConnection(process.env.DATABASE_URL as string);
  const db = drizzle(connection);

  console.log("Seeding database...");

  // Clear existing data (optional, for development)
  await db.delete(deviceControls);
  await db.delete(guideSteps);
  await db.delete(faqs);
  await db.delete(guides);
  await db.delete(devices);

  // Insert devices and create a slug-to-id map
  const deviceIdMap = new Map<string, number>();
  for (const deviceData of DEVICES_DATA) {
    const [result] = await db.insert(devices).values(deviceData);
    deviceIdMap.set(deviceData.slug, Number(result.insertId));
    console.log(`Inserted device: ${deviceData.name} with ID: ${result.insertId}`);
  }
  console.log(`Inserted ${DEVICES_DATA.length} devices.`);

  // Insert guides and map device IDs
  const guideIdMap = new Map<string, number>();
  for (const guideData of GUIDES_DATA) {
    const deviceId = deviceIdMap.get(guideData.deviceSlug);
    if (deviceId) {
      const [result] = await db.insert(guides).values({
        slug: guideData.slug,
        title: guideData.title,
        description: guideData.description,
        category: guideData.category as "mastery" | "guide" | "workflow", // Type assertion for category
        isFree: guideData.isFree,
        sortOrder: guideData.sortOrder,
        deviceId: deviceId,
      });
      const guideId = Number(result.insertId);
      guideIdMap.set(`${guideData.deviceSlug}-${guideData.slug}`, guideId);
      console.log(`Inserted guide: ${guideData.title} with ID: ${guideId}`);

      // Insert guide steps
      const stepsForGuide = GUIDE_STEPS_DATA.filter(s => s.guideSlug === guideData.slug && s.deviceSlug === guideData.deviceSlug);
      for (const stepData of stepsForGuide) {
        await db.insert(guideSteps).values({
          stepNumber: stepData.stepNumber,
          title: stepData.title,
          content: stepData.content,
          relatedControls: stepData.relatedControls,
          tips: stepData.tips || null,
          sortOrder: stepData.sortOrder,
          guideId: guideId,
        });
      }
      console.log(`Inserted ${stepsForGuide.length} steps for guide: ${guideData.title}`);
    }
  }

  // Insert FAQs and map device IDs
  for (const faqData of FAQS_DATA) {
    const deviceId = deviceIdMap.get(faqData.deviceSlug);
    if (deviceId) {
      await db.insert(faqs).values({
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category,
        relatedControls: faqData.relatedControls || null,
        sortOrder: faqData.sortOrder,
        deviceId: deviceId,
      });
      console.log(`Inserted FAQ: ${faqData.question}`);
    }
  }

  // Insert device controls and map device IDs
  for (const controlData of DEVICE_CONTROLS_DATA) {
    const deviceId = deviceIdMap.get(controlData.deviceSlug);
    if (deviceId) {
      await db.insert(deviceControls).values({
        controlId: controlData.controlId,
        name: controlData.name,
        description: controlData.description,
        positionX: controlData.positionX,
        positionY: controlData.positionY,
        width: controlData.width,
        height: controlData.height,
        sortOrder: controlData.sortOrder,
        deviceId: deviceId,
      });
      console.log(`Inserted control: ${controlData.name} for device: ${controlData.deviceSlug}`);
    }
  }

  console.log("Database seeding complete.");
  await connection.end();
}

seed().catch((err) => {
  console.error("Database seeding failed:", err);
  process.exit(1);
});

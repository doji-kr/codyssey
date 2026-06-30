import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, asc, and } from "drizzle-orm";
import { guides, guideSteps, deviceControls } from "../drizzle/schema";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Device routes - Get device information
   */
  devices: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDevices();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getDeviceBySlug(input.slug);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeviceById(input.id);
      }),
  }),

  /**
   * Guide routes - Get learning guides and mastery tracks
   */
  guides: router({
    listByDevice: publicProcedure
      .input(z.object({ deviceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getGuidesByDeviceId(input.deviceId);
      }),

    getBySlug: publicProcedure
      .input(z.object({ deviceId: z.number(), slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getGuideBySlug(input.deviceId, input.slug);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getGuideById(input.id);
      }),

    getSteps: publicProcedure
      .input(z.object({ guideId: z.number() }))
      .query(async ({ input }) => {
        return await db.getGuideStepsByGuideId(input.guideId);
      }),
  }),



  /**
   * FAQ routes - Get frequently asked questions
   */
  faqs: router({
    listByDevice: publicProcedure
      .input(z.object({ deviceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFAQsByDeviceId(input.deviceId);
      }),
  }),

  /**
   * Device controls routes - Get interactive diagram control points
   */
  controls: router({
    listByDevice: publicProcedure
      .input(z.object({ deviceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeviceControlsByDeviceId(input.deviceId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeviceControlById(input.id);
      }),
  }),

  /**
   * AI Chat routes - Ask questions about devices
   * Context: Device manual, official documentation
   */
  chat: router({
    ask: publicProcedure
      .input(z.object({
        deviceId: z.number(),
        question: z.string(),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get device information for context
          const device = await db.getDeviceById(input.deviceId);
          if (!device) {
            throw new Error("Device not found");
          }

          // Get device controls for reference
          const controls = await db.getDeviceControlsByDeviceId(input.deviceId);
          const controlsList = controls.map(c => `${c.name}: ${c.description}`).join('\n');

          // Build system prompt with device context
          const systemPrompt = `You are an expert guide for the ${device.name} (${device.displayName}), a ${device.category}.
${device.description || ''}

Available controls and features:
${controlsList}

Provide clear, concise answers grounded in the official manual. When referencing controls, be specific about their location and function.
Always cite which section or control you're referring to.
Keep answers practical and actionable.`;

          // Prepare conversation history for LLM
          const messages = [
            ...(input.conversationHistory || []),
            { role: 'user' as const, content: input.question }
          ];

          // Call LLM with context
          const llmResponse = await invokeLLM({
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages,
            ],
          });
          const messageContent = llmResponse.choices[0]?.message.content;
          const response = typeof messageContent === 'string' ? messageContent : '';

          // Save chat history
          const userId = ctx.user?.id || null;
          await db.saveChatMessage(
            userId,
            input.deviceId,
            input.question,
            response
          );

          return {
            answer: response,
            deviceName: device.name,
          };
        } catch (error) {
          console.error("[Chat] Error:", error);
          throw error;
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ deviceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChatHistoryByDeviceId(input.deviceId, 20);
      }),
  }),

  /**
   * Subscription routes - Check user subscription status
   */
  subscription: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      return {
        tier: user?.subscriptionTier || 'free',
        isPro: user?.subscriptionTier === 'pro',
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

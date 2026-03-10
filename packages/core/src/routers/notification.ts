import { db, notificationLog, notificationRule } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const notificationRouter = router({
	create: orgProcedure
		.input(
			z.object({
				moduleId: z.string().optional(),
				triggerEvent: z.string().min(1),
				channel: z.string().default("in_app"),
				recipientType: z.string().min(1),
				recipientId: z.string().optional(),
				messageTemplate: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(notificationRule).values({
				id,
				organizationId: ctx.organizationId,
				moduleId: input.moduleId ?? null,
				triggerEvent: input.triggerEvent,
				channel: input.channel,
				recipientType: input.recipientType,
				recipientId: input.recipientId ?? null,
				messageTemplate: input.messageTemplate ?? null,
			});

			return { id };
		}),

	list: orgProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(notificationRule)
			.where(eq(notificationRule.organizationId, ctx.organizationId))
			.orderBy(desc(notificationRule.createdAt))
			.limit(100);
	}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(notificationRule)
				.where(
					and(
						eq(notificationRule.id, input.id),
						eq(notificationRule.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Rule not found",
				});
			}

			return { success: true };
		}),

	logs: orgProcedure
		.input(z.object({ limit: z.number().min(1).max(100).default(20) }))
		.query(async ({ ctx, input }) => {
			return await db
				.select({
					id: notificationLog.id,
					ruleId: notificationLog.ruleId,
					channel: notificationLog.channel,
					status: notificationLog.status,
					sentAt: notificationLog.sentAt,
					createdAt: notificationLog.createdAt,
					triggerEvent: notificationRule.triggerEvent,
				})
				.from(notificationLog)
				.leftJoin(
					notificationRule,
					eq(notificationLog.ruleId, notificationRule.id)
				)
				.where(eq(notificationRule.organizationId, ctx.organizationId))
				.orderBy(desc(notificationLog.createdAt))
				.limit(input.limit);
		}),
});

import { activity, db } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const activityRouter = router({
	forRecord: orgProcedure
		.input(
			z.object({
				recordId: z.string(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(activity.organizationId, ctx.organizationId),
				eq(activity.recordId, input.recordId),
			];

			if (input.cursor) {
				conditions.push(sql`${activity.id} < ${input.cursor}`);
			}

			const items = await db
				.select()
				.from(activity)
				.where(and(...conditions))
				.orderBy(desc(activity.createdAt))
				.limit(input.limit + 1);

			const hasMore = items.length > input.limit;
			if (hasMore) {
				items.pop();
			}

			return {
				items,
				nextCursor: hasMore ? items.at(-1)?.id : null,
			};
		}),

	forContact: orgProcedure
		.input(
			z.object({
				contactId: z.string(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(activity.organizationId, ctx.organizationId),
				eq(activity.contactId, input.contactId),
			];

			if (input.cursor) {
				conditions.push(sql`${activity.id} < ${input.cursor}`);
			}

			const items = await db
				.select()
				.from(activity)
				.where(and(...conditions))
				.orderBy(desc(activity.createdAt))
				.limit(input.limit + 1);

			const hasMore = items.length > input.limit;
			if (hasMore) {
				items.pop();
			}

			return {
				items,
				nextCursor: hasMore ? items.at(-1)?.id : null,
			};
		}),

	recent: orgProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
			})
		)
		.query(async ({ ctx, input }) => {
			return await db
				.select()
				.from(activity)
				.where(eq(activity.organizationId, ctx.organizationId))
				.orderBy(desc(activity.createdAt))
				.limit(input.limit);
		}),
});

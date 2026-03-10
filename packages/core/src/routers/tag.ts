import { db, tag, taggable } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const tagRouter = router({
	create: orgProcedure
		.input(
			z.object({
				name: z.string().min(1),
				color: z.string().nullish(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(tag).values({
				id,
				organizationId: ctx.organizationId,
				name: input.name,
				color: input.color ?? null,
			});

			return { id };
		}),

	list: orgProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(tag)
			.where(eq(tag.organizationId, ctx.organizationId))
			.orderBy(tag.name)
			.limit(100);
	}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(tag)
				.where(
					and(eq(tag.id, input.id), eq(tag.organizationId, ctx.organizationId))
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag not found",
				});
			}

			return { success: true };
		}),

	attach: orgProcedure
		.input(
			z.object({
				tagId: z.string(),
				entityType: z.string(),
				entityId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const id = crypto.randomUUID();

			await db.insert(taggable).values({
				id,
				tagId: input.tagId,
				entityType: input.entityType,
				entityId: input.entityId,
			});

			return { id };
		}),

	detach: orgProcedure
		.input(
			z.object({
				tagId: z.string(),
				entityType: z.string(),
				entityId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			await db
				.delete(taggable)
				.where(
					and(
						eq(taggable.tagId, input.tagId),
						eq(taggable.entityType, input.entityType),
						eq(taggable.entityId, input.entityId)
					)
				);
			return { success: true };
		}),

	forEntity: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const taggables = await db
				.select({ tag })
				.from(taggable)
				.innerJoin(tag, eq(taggable.tagId, tag.id))
				.where(
					and(
						eq(taggable.entityType, input.entityType),
						eq(taggable.entityId, input.entityId)
					)
				)
				.limit(100);

			return taggables.map((t) => t.tag);
		}),
});

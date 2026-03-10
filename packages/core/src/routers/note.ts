import { db, note } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const noteRouter = router({
	create: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
				content: z.string().min(1),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(note).values({
				id,
				organizationId: ctx.organizationId,
				entityType: input.entityType,
				entityId: input.entityId,
				content: input.content,
				authorId: ctx.session.user.id,
			});

			return { id };
		}),

	list: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await db
				.select()
				.from(note)
				.where(
					and(
						eq(note.organizationId, ctx.organizationId),
						eq(note.entityType, input.entityType),
						eq(note.entityId, input.entityId)
					)
				)
				.orderBy(desc(note.createdAt))
				.limit(100);
		}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				content: z.string().min(1),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await db
				.update(note)
				.set({ content: input.content })
				.where(
					and(
						eq(note.id, input.id),
						eq(note.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return updated;
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(note)
				.where(
					and(
						eq(note.id, input.id),
						eq(note.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return { success: true };
		}),
});

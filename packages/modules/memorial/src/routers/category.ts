import { logActivity } from "@bizcare-crm/core";
import { db, memorialCategory } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

export const categoryRouter = router({
	create: orgProcedure
		.input(
			z.object({
				nameEn: z.string().nullish(),
				nameZh: z.string().nullish(),
				locationFormat: z.string().nullish(),
				position: z.number().default(0),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(memorialCategory).values({
				id,
				organizationId: ctx.organizationId,
				nameEn: input.nameEn ?? null,
				nameZh: input.nameZh ?? null,
				locationFormat: input.locationFormat ?? null,
				position: input.position,
			});

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				moduleId: "memorial",
				type: "memorial_category.created",
				description: `Category "${input.nameEn ?? input.nameZh ?? "Untitled"}" created`,
			});

			return { id };
		}),

	list: orgProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(memorialCategory)
			.where(eq(memorialCategory.organizationId, ctx.organizationId))
			.orderBy(asc(memorialCategory.position))
			.limit(100);
	}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				nameEn: z.string().nullish(),
				nameZh: z.string().nullish(),
				locationFormat: z.string().nullish(),
				position: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(memorialCategory)
				.set(data)
				.where(
					and(
						eq(memorialCategory.id, id),
						eq(memorialCategory.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Category not found",
				});
			}

			return updated;
		}),

	reorder: orgProcedure
		.input(
			z.object({
				items: z.array(
					z.object({
						id: z.string(),
						position: z.number(),
					})
				),
			})
		)
		.mutation(async ({ ctx, input }) => {
			for (const item of input.items) {
				await db
					.update(memorialCategory)
					.set({ position: item.position })
					.where(
						and(
							eq(memorialCategory.id, item.id),
							eq(memorialCategory.organizationId, ctx.organizationId)
						)
					);
			}

			return { success: true };
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(memorialCategory)
				.where(
					and(
						eq(memorialCategory.id, input.id),
						eq(memorialCategory.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Category not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				moduleId: "memorial",
				type: "memorial_category.deleted",
				description: `Category "${deleted.nameEn ?? deleted.nameZh ?? "Untitled"}" deleted`,
			});

			return { success: true };
		}),
});

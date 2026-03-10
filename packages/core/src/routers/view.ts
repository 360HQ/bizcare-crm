import { db, savedView } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const viewRouter = router({
	create: orgProcedure
		.input(
			z.object({
				moduleId: z.string(),
				name: z.string().min(1),
				filters: z.array(z.record(z.string(), z.unknown())).optional(),
				sortBy: z.record(z.string(), z.unknown()).nullish(),
				columns: z.array(z.string()).nullish(),
				isDefault: z.boolean().default(false),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(savedView).values({
				id,
				organizationId: ctx.organizationId,
				moduleId: input.moduleId,
				userId: ctx.session.user.id,
				name: input.name,
				filters: input.filters ?? [],
				sortBy: input.sortBy ?? null,
				columns: input.columns ?? null,
				isDefault: input.isDefault,
			});

			return { id };
		}),

	list: orgProcedure
		.input(z.object({ moduleId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await db
				.select()
				.from(savedView)
				.where(
					and(
						eq(savedView.organizationId, ctx.organizationId),
						eq(savedView.userId, ctx.session.user.id),
						eq(savedView.moduleId, input.moduleId)
					)
				)
				.limit(100);
		}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				filters: z.array(z.record(z.string(), z.unknown())).optional(),
				sortBy: z.record(z.string(), z.unknown()).nullish(),
				columns: z.array(z.string()).nullish(),
				isDefault: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(savedView)
				.set(data)
				.where(
					and(eq(savedView.id, id), eq(savedView.userId, ctx.session.user.id))
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "View not found",
				});
			}

			return updated;
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(savedView)
				.where(
					and(
						eq(savedView.id, input.id),
						eq(savedView.userId, ctx.session.user.id)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "View not found",
				});
			}

			return { success: true };
		}),
});

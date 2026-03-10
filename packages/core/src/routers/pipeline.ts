import { db, pipeline, pipelineStage } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

export const pipelineRouter = router({
	create: orgProcedure
		.input(
			z.object({
				moduleId: z.string(),
				name: z.string().min(1),
				stages: z
					.array(
						z.object({
							name: z.string().min(1),
							color: z.string().nullish(),
						})
					)
					.optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const pipelineId = crypto.randomUUID();

			await db.insert(pipeline).values({
				id: pipelineId,
				organizationId: ctx.organizationId,
				moduleId: input.moduleId,
				name: input.name,
			});

			if (input.stages?.length) {
				const stageValues = input.stages.map((s, i) => ({
					id: crypto.randomUUID(),
					pipelineId,
					name: s.name,
					color: s.color ?? null,
					position: i,
				}));
				await db.insert(pipelineStage).values(stageValues);
			}

			return { id: pipelineId };
		}),

	get: orgProcedure
		.input(z.object({ moduleId: z.string() }))
		.query(async ({ ctx, input }) => {
			const [result] = await db
				.select()
				.from(pipeline)
				.where(
					and(
						eq(pipeline.organizationId, ctx.organizationId),
						eq(pipeline.moduleId, input.moduleId)
					)
				)
				.limit(1);

			if (!result) {
				return null;
			}

			const stages = await db
				.select()
				.from(pipelineStage)
				.where(eq(pipelineStage.pipelineId, result.id))
				.orderBy(asc(pipelineStage.position));

			return { ...result, stages };
		}),

	addStage: orgProcedure
		.input(
			z.object({
				pipelineId: z.string(),
				name: z.string().min(1),
				color: z.string().nullish(),
				position: z.number(),
			})
		)
		.mutation(async ({ input }) => {
			const id = crypto.randomUUID();

			await db.insert(pipelineStage).values({
				id,
				pipelineId: input.pipelineId,
				name: input.name,
				color: input.color ?? null,
				position: input.position,
			});

			return { id };
		}),

	updateStage: orgProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				color: z.string().nullish(),
				position: z.number().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(pipelineStage)
				.set(data)
				.where(eq(pipelineStage.id, id))
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Pipeline stage not found",
				});
			}

			return updated;
		}),

	deleteStage: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const [deleted] = await db
				.delete(pipelineStage)
				.where(eq(pipelineStage.id, input.id))
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Pipeline stage not found",
				});
			}

			return { success: true };
		}),
});

import { db, record, recordContact } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logActivity } from "../services/activity";

export const recordRouter = router({
	create: orgProcedure
		.input(
			z.object({
				moduleId: z.string(),
				pipelineStageId: z.string().nullish(),
				title: z.string().nullish(),
				customFields: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(record).values({
				id,
				organizationId: ctx.organizationId,
				moduleId: input.moduleId,
				pipelineStageId: input.pipelineStageId ?? null,
				title: input.title ?? null,
				customFields: input.customFields ?? {},
				createdBy: ctx.session.user.id,
			});

			await logActivity({
				organizationId: ctx.organizationId,
				recordId: id,
				actorId: ctx.session.user.id,
				moduleId: input.moduleId,
				type: "record.created",
				description: `Record "${input.title ?? "Untitled"}" created`,
			});

			return { id };
		}),

	list: orgProcedure
		.input(
			z.object({
				moduleId: z.string().optional(),
				pipelineStageId: z.string().optional(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(record.organizationId, ctx.organizationId)];

			if (input.moduleId) {
				conditions.push(eq(record.moduleId, input.moduleId));
			}
			if (input.pipelineStageId) {
				conditions.push(eq(record.pipelineStageId, input.pipelineStageId));
			}
			if (input.cursor) {
				conditions.push(sql`${record.id} > ${input.cursor}`);
			}

			const items = await db
				.select()
				.from(record)
				.where(and(...conditions))
				.orderBy(record.id)
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

	get: orgProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [result] = await db
				.select()
				.from(record)
				.where(
					and(
						eq(record.id, input.id),
						eq(record.organizationId, ctx.organizationId)
					)
				)
				.limit(1);

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Record not found",
				});
			}

			return result;
		}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				pipelineStageId: z.string().nullish(),
				title: z.string().nullish(),
				customFields: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(record)
				.set(data)
				.where(
					and(eq(record.id, id), eq(record.organizationId, ctx.organizationId))
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Record not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				recordId: id,
				actorId: ctx.session.user.id,
				moduleId: updated.moduleId,
				type: "record.updated",
				description: `Record "${updated.title ?? "Untitled"}" updated`,
			});

			return updated;
		}),

	changePipelineStage: orgProcedure
		.input(
			z.object({
				id: z.string(),
				pipelineStageId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await db
				.update(record)
				.set({ pipelineStageId: input.pipelineStageId })
				.where(
					and(
						eq(record.id, input.id),
						eq(record.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Record not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				recordId: input.id,
				actorId: ctx.session.user.id,
				moduleId: updated.moduleId,
				type: "record.stage_changed",
				description: "Record moved to new pipeline stage",
			});

			return updated;
		}),

	linkContact: orgProcedure
		.input(
			z.object({
				recordId: z.string(),
				contactId: z.string(),
				role: z.string(),
				isPrimary: z.string().default("false"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(recordContact).values({
				id,
				recordId: input.recordId,
				contactId: input.contactId,
				role: input.role,
				isPrimary: input.isPrimary,
			});

			await logActivity({
				organizationId: ctx.organizationId,
				recordId: input.recordId,
				contactId: input.contactId,
				actorId: ctx.session.user.id,
				type: "record.contact_linked",
				description: `Contact linked as "${input.role}"`,
			});

			return { id };
		}),

	unlinkContact: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(recordContact)
				.where(eq(recordContact.id, input.id))
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Record contact link not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				type: "record.contact_unlinked",
				description: "Contact unlinked from record",
			});

			return { success: true };
		}),

	contacts: orgProcedure
		.input(z.object({ recordId: z.string() }))
		.query(async ({ input }) => {
			return await db
				.select()
				.from(recordContact)
				.where(eq(recordContact.recordId, input.recordId))
				.limit(100);
		}),
});

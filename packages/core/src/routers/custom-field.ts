import { customFieldDefinition, db } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

const fieldOptionSchema = z.object({
	value: z.string(),
	labelEn: z.string(),
	labelZh: z.string(),
});

export const customFieldRouter = router({
	create: orgProcedure
		.input(
			z.object({
				moduleId: z.string(),
				entityType: z.string(),
				fieldKey: z
					.string()
					.min(1)
					.regex(/^[a-z_][a-z0-9_]*$/),
				labelEn: z.string().nullish(),
				labelZh: z.string().nullish(),
				fieldType: z.enum([
					"text",
					"number",
					"date",
					"select",
					"multiselect",
					"boolean",
					"url",
				]),
				options: z.array(fieldOptionSchema).optional(),
				isRequired: z.boolean().default(false),
				position: z.number().default(0),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(customFieldDefinition).values({
				id,
				organizationId: ctx.organizationId,
				moduleId: input.moduleId,
				entityType: input.entityType,
				fieldKey: input.fieldKey,
				labelEn: input.labelEn ?? null,
				labelZh: input.labelZh ?? null,
				fieldType: input.fieldType,
				options: input.options ?? [],
				isRequired: input.isRequired,
				position: input.position,
			});

			return { id };
		}),

	list: orgProcedure
		.input(
			z.object({
				moduleId: z.string(),
				entityType: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(customFieldDefinition.organizationId, ctx.organizationId),
				eq(customFieldDefinition.moduleId, input.moduleId),
			];

			if (input.entityType) {
				conditions.push(eq(customFieldDefinition.entityType, input.entityType));
			}

			return await db
				.select()
				.from(customFieldDefinition)
				.where(and(...conditions))
				.orderBy(asc(customFieldDefinition.position))
				.limit(100);
		}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				labelEn: z.string().nullish(),
				labelZh: z.string().nullish(),
				options: z.array(fieldOptionSchema).optional(),
				isRequired: z.boolean().optional(),
				position: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(customFieldDefinition)
				.set(data)
				.where(
					and(
						eq(customFieldDefinition.id, id),
						eq(customFieldDefinition.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Custom field definition not found",
				});
			}

			return updated;
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(customFieldDefinition)
				.where(
					and(
						eq(customFieldDefinition.id, input.id),
						eq(customFieldDefinition.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Custom field definition not found",
				});
			}

			return { success: true };
		}),
});

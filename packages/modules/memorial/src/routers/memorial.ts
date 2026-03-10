import { logActivity } from "@bizcare-crm/core";
import {
	contact,
	db,
	memorial,
	memorialCategory,
	record,
	recordContact,
} from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

function generateSlug(nameEn: string | null | undefined): string {
	const base = (nameEn ?? "memorial")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const suffix = crypto.randomUUID().slice(0, 8);
	return `${base}-${suffix}`;
}

function orNull<T>(value: T | null | undefined): T | null {
	return value ?? null;
}

interface CreateMemorialInput {
	categoryId?: string | null;
	customFields?: Record<string, unknown>;
	dateOfBirth?: string | null;
	dateOfBirthLunar?: string | null;
	dateOfDeath?: string | null;
	dateOfDeathLunar?: string | null;
	familyOrigin?: string | null;
	gender?: string | null;
	internmentStatus?: string | null;
	isPublic: boolean;
	location?: string | null;
	memorialServiceDate?: string | null;
	nameEn?: string | null;
	nameZh?: string | null;
	nric?: string | null;
	organizationId: string;
	photo?: string | null;
	serialNumber?: string | null;
	userId: string;
}

async function createMemorialWithRecord(input: CreateMemorialInput) {
	const recordId = crypto.randomUUID();
	const memorialId = crypto.randomUUID();
	const contactId = crypto.randomUUID();
	const linkId = crypto.randomUUID();
	const publicSlug = generateSlug(input.nameEn);
	const title =
		input.nameEn ?? input.nameZh ?? `Memorial ${memorialId.slice(0, 8)}`;

	await db.insert(record).values({
		id: recordId,
		organizationId: input.organizationId,
		moduleId: "memorial",
		title,
		createdBy: input.userId,
	});

	await db.insert(memorial).values({
		id: memorialId,
		organizationId: input.organizationId,
		recordId,
		categoryId: orNull(input.categoryId),
		serialNumber: orNull(input.serialNumber),
		location: orNull(input.location),
		nameEn: orNull(input.nameEn),
		nameZh: orNull(input.nameZh),
		gender: orNull(input.gender),
		nric: orNull(input.nric),
		dateOfBirth: orNull(input.dateOfBirth),
		dateOfBirthLunar: orNull(input.dateOfBirthLunar),
		dateOfDeath: orNull(input.dateOfDeath),
		dateOfDeathLunar: orNull(input.dateOfDeathLunar),
		familyOrigin: orNull(input.familyOrigin),
		internmentStatus: orNull(input.internmentStatus),
		memorialServiceDate: orNull(input.memorialServiceDate),
		isPublic: input.isPublic,
		publicSlug,
		photo: orNull(input.photo),
		customFields: input.customFields ?? {},
	});

	await db.insert(contact).values({
		id: contactId,
		organizationId: input.organizationId,
		nameEn: orNull(input.nameEn),
		nameZh: orNull(input.nameZh),
		gender: orNull(input.gender),
		nric: orNull(input.nric),
		dateOfBirth: orNull(input.dateOfBirth),
		dateOfBirthLunar: orNull(input.dateOfBirthLunar),
		familyOrigin: orNull(input.familyOrigin),
		type: "deceased",
	});

	await db.insert(recordContact).values({
		id: linkId,
		recordId,
		contactId,
		role: "deceased",
		isPrimary: "true",
	});

	await logActivity({
		organizationId: input.organizationId,
		recordId,
		actorId: input.userId,
		moduleId: "memorial",
		type: "memorial.created",
		description: `Memorial "${title}" created`,
	});

	return { id: memorialId, recordId, publicSlug };
}

const createInput = z.object({
	categoryId: z.string().nullish(),
	serialNumber: z.string().nullish(),
	location: z.string().nullish(),
	nameEn: z.string().nullish(),
	nameZh: z.string().nullish(),
	gender: z.string().nullish(),
	nric: z.string().nullish(),
	dateOfBirth: z.string().nullish(),
	dateOfBirthLunar: z.string().nullish(),
	dateOfDeath: z.string().nullish(),
	dateOfDeathLunar: z.string().nullish(),
	familyOrigin: z.string().nullish(),
	internmentStatus: z.string().nullish(),
	memorialServiceDate: z.string().nullish(),
	isPublic: z.boolean().default(false),
	photo: z.string().nullish(),
	customFields: z.record(z.string(), z.unknown()).optional(),
});

export const memorialRouter = router({
	create: orgProcedure.input(createInput).mutation(async ({ ctx, input }) => {
		return await createMemorialWithRecord({
			...input,
			organizationId: ctx.organizationId,
			userId: ctx.session.user.id,
		});
	}),

	list: orgProcedure
		.input(
			z.object({
				categoryId: z.string().optional(),
				search: z.string().optional(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(memorial.organizationId, ctx.organizationId)];

			if (input.categoryId) {
				conditions.push(eq(memorial.categoryId, input.categoryId));
			}
			if (input.search) {
				const term = `%${input.search}%`;
				conditions.push(
					or(
						ilike(memorial.nameEn, term),
						ilike(memorial.nameZh, term),
						ilike(memorial.serialNumber, term)
					) ?? sql`true`
				);
			}
			if (input.cursor) {
				conditions.push(sql`${memorial.id} > ${input.cursor}`);
			}

			const items = await db
				.select({
					memorial,
					categoryNameEn: memorialCategory.nameEn,
					categoryNameZh: memorialCategory.nameZh,
				})
				.from(memorial)
				.leftJoin(
					memorialCategory,
					eq(memorial.categoryId, memorialCategory.id)
				)
				.where(and(...conditions))
				.orderBy(memorial.id)
				.limit(input.limit + 1);

			const hasMore = items.length > input.limit;
			if (hasMore) {
				items.pop();
			}

			return {
				items: items.map((i) => ({
					...i.memorial,
					categoryNameEn: i.categoryNameEn,
					categoryNameZh: i.categoryNameZh,
				})),
				nextCursor: hasMore ? items.at(-1)?.memorial.id : null,
			};
		}),

	get: orgProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [result] = await db
				.select({
					memorial,
					categoryNameEn: memorialCategory.nameEn,
					categoryNameZh: memorialCategory.nameZh,
				})
				.from(memorial)
				.leftJoin(
					memorialCategory,
					eq(memorial.categoryId, memorialCategory.id)
				)
				.where(
					and(
						eq(memorial.id, input.id),
						eq(memorial.organizationId, ctx.organizationId)
					)
				)
				.limit(1);

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Memorial not found",
				});
			}

			return {
				...result.memorial,
				categoryNameEn: result.categoryNameEn,
				categoryNameZh: result.categoryNameZh,
			};
		}),

	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				categoryId: z.string().nullish(),
				serialNumber: z.string().nullish(),
				location: z.string().nullish(),
				nameEn: z.string().nullish(),
				nameZh: z.string().nullish(),
				gender: z.string().nullish(),
				nric: z.string().nullish(),
				dateOfBirth: z.string().nullish(),
				dateOfBirthLunar: z.string().nullish(),
				dateOfDeath: z.string().nullish(),
				dateOfDeathLunar: z.string().nullish(),
				familyOrigin: z.string().nullish(),
				internmentStatus: z.string().nullish(),
				memorialServiceDate: z.string().nullish(),
				isPublic: z.boolean().optional(),
				photo: z.string().nullish(),
				customFields: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(memorial)
				.set(data)
				.where(
					and(
						eq(memorial.id, id),
						eq(memorial.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Memorial not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				recordId: updated.recordId,
				actorId: ctx.session.user.id,
				moduleId: "memorial",
				type: "memorial.updated",
				description: `Memorial "${updated.nameEn ?? updated.nameZh ?? "Untitled"}" updated`,
			});

			return updated;
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(memorial)
				.where(
					and(
						eq(memorial.id, input.id),
						eq(memorial.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Memorial not found",
				});
			}

			await db.delete(record).where(eq(record.id, deleted.recordId));

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				moduleId: "memorial",
				type: "memorial.deleted",
				description: `Memorial "${deleted.nameEn ?? deleted.nameZh ?? "Untitled"}" deleted`,
			});

			return { success: true };
		}),
});

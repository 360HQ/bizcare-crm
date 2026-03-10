import { contact, db } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { logActivity } from "../services/activity";

const contactInput = z.object({
	type: z.enum(["individual", "organization"]).default("individual"),
	nameEn: z.string().nullish(),
	nameZh: z.string().nullish(),
	email: z.string().email().nullish(),
	phone: z.string().nullish(),
	gender: z.string().nullish(),
	nric: z.string().nullish(),
	addressLine1: z.string().nullish(),
	addressLine2: z.string().nullish(),
	city: z.string().nullish(),
	state: z.string().nullish(),
	postalCode: z.string().nullish(),
	country: z.string().nullish(),
	dateOfBirth: z.string().nullish(),
	dateOfBirthLunar: z.string().nullish(),
	familyOrigin: z.string().nullish(),
	profileImage: z.string().nullish(),
	customFields: z.record(z.string(), z.unknown()).optional(),
});

export const contactRouter = router({
	create: orgProcedure.input(contactInput).mutation(async ({ ctx, input }) => {
		const id = crypto.randomUUID();

		await db.insert(contact).values({
			id,
			organizationId: ctx.organizationId,
			...input,
			customFields: input.customFields ?? {},
		});

		await logActivity({
			organizationId: ctx.organizationId,
			contactId: id,
			actorId: ctx.session.user.id,
			type: "contact.created",
			description: `Contact "${input.nameEn ?? input.nameZh ?? "Unknown"}" created`,
		});

		return { id };
	}),

	list: orgProcedure
		.input(
			z.object({
				search: z.string().optional(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
			})
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(contact.organizationId, ctx.organizationId)];

			if (input.search) {
				const pattern = `%${input.search}%`;
				conditions.push(
					or(
						ilike(contact.nameEn, pattern),
						ilike(contact.nameZh, pattern),
						ilike(contact.email, pattern),
						ilike(contact.phone, pattern)
					) ?? sql`true`
				);
			}

			if (input.cursor) {
				conditions.push(sql`${contact.id} > ${input.cursor}`);
			}

			const items = await db
				.select()
				.from(contact)
				.where(and(...conditions))
				.orderBy(contact.id)
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
				.from(contact)
				.where(
					and(
						eq(contact.id, input.id),
						eq(contact.organizationId, ctx.organizationId)
					)
				)
				.limit(1);

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			return result;
		}),

	update: orgProcedure
		.input(z.object({ id: z.string() }).merge(contactInput.partial()))
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const [updated] = await db
				.update(contact)
				.set(data)
				.where(
					and(
						eq(contact.id, id),
						eq(contact.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				contactId: id,
				actorId: ctx.session.user.id,
				type: "contact.updated",
				description: `Contact "${updated.nameEn ?? updated.nameZh ?? "Unknown"}" updated`,
			});

			return updated;
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(contact)
				.where(
					and(
						eq(contact.id, input.id),
						eq(contact.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				contactId: input.id,
				actorId: ctx.session.user.id,
				type: "contact.deleted",
				description: "Contact deleted",
			});

			return { success: true };
		}),
});

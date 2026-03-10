import { logActivity } from "@bizcare-crm/core";
import {
	contact,
	db,
	memorial,
	memorialClaim,
	recordContact,
} from "@bizcare-crm/db";
import { orgProcedure, publicProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const claimRouter = router({
	submit: publicProcedure
		.input(
			z.object({
				memorialId: z.string(),
				fullName: z.string().min(1),
				relationship: z.string().min(1),
				nric: z.string().nullish(),
				phone: z.string().nullish(),
				email: z.string().email().nullish(),
			})
		)
		.mutation(async ({ input }) => {
			const [mem] = await db
				.select()
				.from(memorial)
				.where(
					and(eq(memorial.id, input.memorialId), eq(memorial.isPublic, true))
				)
				.limit(1);

			if (!mem) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Memorial not found or not public",
				});
			}

			const claimId = crypto.randomUUID();
			const contactId = crypto.randomUUID();
			const linkId = crypto.randomUUID();

			await db.insert(contact).values({
				id: contactId,
				organizationId: mem.organizationId,
				nameEn: input.fullName,
				phone: input.phone ?? null,
				email: input.email ?? null,
				nric: input.nric ?? null,
				type: "descendant",
			});

			await db.insert(memorialClaim).values({
				id: claimId,
				memorialId: input.memorialId,
				fullName: input.fullName,
				relationship: input.relationship,
				nric: input.nric ?? null,
				phone: input.phone ?? null,
				email: input.email ?? null,
				status: "confirmed",
				contactId,
			});

			await db.insert(recordContact).values({
				id: linkId,
				recordId: mem.recordId,
				contactId,
				role: input.relationship,
				isPrimary: "false",
			});

			await logActivity({
				organizationId: mem.organizationId,
				recordId: mem.recordId,
				contactId,
				moduleId: "memorial",
				type: "memorial.claim_submitted",
				description: `${input.fullName} claimed as ${input.relationship}`,
			});

			return { id: claimId };
		}),

	list: orgProcedure
		.input(z.object({ memorialId: z.string() }))
		.query(async ({ input }) => {
			return await db
				.select()
				.from(memorialClaim)
				.where(eq(memorialClaim.memorialId, input.memorialId))
				.limit(100);
		}),

	get: orgProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const [claim] = await db
				.select()
				.from(memorialClaim)
				.where(eq(memorialClaim.id, input.id))
				.limit(1);

			if (!claim) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Claim not found",
				});
			}

			return claim;
		}),
});

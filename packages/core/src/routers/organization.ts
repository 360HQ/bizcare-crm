import { db, organization, organizationMember } from "@bizcare-crm/db";
import { orgProcedure, protectedProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { logActivity } from "../services/activity";

export const organizationRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				slug: z
					.string()
					.min(1)
					.regex(/^[a-z0-9-]+$/),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const orgId = crypto.randomUUID();
			const memberId = crypto.randomUUID();

			await db.insert(organization).values({
				id: orgId,
				name: input.name,
				slug: input.slug,
			});

			await db.insert(organizationMember).values({
				id: memberId,
				organizationId: orgId,
				userId: ctx.session.user.id,
				role: "owner",
			});

			await logActivity({
				organizationId: orgId,
				actorId: ctx.session.user.id,
				type: "organization.created",
				description: `Organization "${input.name}" created`,
			});

			return { id: orgId, slug: input.slug };
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		const members = await db
			.select({
				orgId: organizationMember.organizationId,
				role: organizationMember.role,
				org: organization,
			})
			.from(organizationMember)
			.innerJoin(
				organization,
				eq(organizationMember.organizationId, organization.id)
			)
			.where(eq(organizationMember.userId, ctx.session.user.id))
			.limit(100);

		return members.map((m) => ({
			...m.org,
			role: m.role,
		}));
	}),

	get: orgProcedure.query(async ({ ctx }) => {
		const [org] = await db
			.select()
			.from(organization)
			.where(eq(organization.id, ctx.organizationId))
			.limit(1);

		if (!org) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Organization not found",
			});
		}

		return org;
	}),

	update: orgProcedure
		.input(
			z.object({
				name: z.string().min(1).optional(),
				logo: z.string().optional(),
				settings: z.record(z.string(), z.unknown()).optional(),
				enabledModules: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await db
				.update(organization)
				.set(input)
				.where(eq(organization.id, ctx.organizationId))
				.returning();

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				type: "organization.updated",
				description: "Organization settings updated",
			});

			return updated;
		}),

	addMember: orgProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["admin", "member", "viewer"]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(organizationMember).values({
				id,
				organizationId: ctx.organizationId,
				userId: input.userId,
				role: input.role,
			});

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				type: "organization.member_added",
				description: `Member added with role "${input.role}"`,
			});

			return { id };
		}),

	removeMember: orgProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(organizationMember)
				.where(
					and(
						eq(organizationMember.organizationId, ctx.organizationId),
						eq(organizationMember.userId, input.userId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization member not found",
				});
			}

			await logActivity({
				organizationId: ctx.organizationId,
				actorId: ctx.session.user.id,
				type: "organization.member_removed",
				description: "Member removed from organization",
			});

			return { success: true };
		}),

	members: orgProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(organizationMember)
			.where(eq(organizationMember.organizationId, ctx.organizationId))
			.limit(100);
	}),
});

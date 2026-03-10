import { db, organizationMember } from "@bizcare-crm/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { Context } from "./context";

export type { Context, CreateContextOptions } from "./context";
export { createContext } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (!ctx.organizationId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Organization context required",
			cause: "No x-organization-id header",
		});
	}

	const membership = await db
		.select({ id: organizationMember.id })
		.from(organizationMember)
		.where(
			and(
				eq(organizationMember.userId, ctx.session.user.id),
				eq(organizationMember.organizationId, ctx.organizationId)
			)
		)
		.limit(1);

	if (membership.length === 0) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You are not a member of this organization",
		});
	}

	return next({
		ctx: {
			...ctx,
			organizationId: ctx.organizationId,
		},
	});
});

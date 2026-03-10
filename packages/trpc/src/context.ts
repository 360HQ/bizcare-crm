import { auth } from "@bizcare-crm/auth";
import type { Context as HonoContext } from "hono";

export interface CreateContextOptions {
	context: HonoContext;
}

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});
	const organizationId =
		context.req.raw.headers.get("x-organization-id") ?? null;
	return {
		session,
		organizationId,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

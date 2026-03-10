import { coreRouter } from "@bizcare-crm/core";
import { memorialModuleRouter } from "@bizcare-crm/memorial";
import { protectedProcedure, publicProcedure, router } from "../index";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	core: coreRouter,
	memorial: memorialModuleRouter,
});
export type AppRouter = typeof appRouter;

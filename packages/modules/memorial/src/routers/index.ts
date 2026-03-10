import { router } from "@bizcare-crm/trpc";
import { categoryRouter } from "./category";
import { claimRouter } from "./claim";
import { memorialRouter } from "./memorial";
import { publicRouter } from "./public";

export const memorialModuleRouter = router({
	memorial: memorialRouter,
	category: categoryRouter,
	claim: claimRouter,
	public: publicRouter,
});

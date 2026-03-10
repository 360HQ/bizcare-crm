import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_SERVER_URL: z.string().url(),
		VITE_PUBLIC_ORG_ID: z.string().min(1),
	},
	runtimeEnv: (import.meta as any).env,
	emptyStringAsUndefined: true,
});

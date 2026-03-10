import { createContext } from "@bizcare-crm/api/context";
import { appRouter } from "@bizcare-crm/api/routers/index";
import { auth } from "@bizcare-crm/auth";
import { env } from "@bizcare-crm/env/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { r2Routes } from "./r2-routes";
import { rateLimit } from "./rate-limit";

const app = new Hono();

app.use(logger());
app.use("/trpc/memorial.public.*", rateLimit);
app.use("/trpc/memorial.claim.*", rateLimit);
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "x-organization-id"],
		credentials: true,
	})
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/r2", r2Routes);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	})
);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;

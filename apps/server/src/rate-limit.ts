import type { Context, Next } from "hono";

const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function getClientIp(c: Context): string {
	return (
		c.req.header("cf-connecting-ip") ??
		c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
		"unknown"
	);
}

export async function rateLimit(c: Context, next: Next) {
	const ip = getClientIp(c);
	const now = Date.now();
	const entry = requests.get(ip);

	if (entry && entry.resetAt > now) {
		if (entry.count >= MAX_REQUESTS) {
			return c.json({ error: "Too many requests" }, 429);
		}
		entry.count++;
	} else {
		requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
	}

	await next();
}

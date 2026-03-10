import { auth } from "@bizcare-crm/auth";
import { consumeUploadToken } from "@bizcare-crm/core";
import { env } from "@bizcare-crm/env/server";
import { Hono } from "hono";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getBucket(): R2Bucket {
	return (env as unknown as { ATTACHMENTS_BUCKET: R2Bucket })
		.ATTACHMENTS_BUCKET;
}

export const r2Routes = new Hono();

r2Routes.put("/upload/:token", async (c) => {
	const token = c.req.param("token");
	const pending = await consumeUploadToken(token);

	if (!pending) {
		return c.json({ error: "Invalid or expired upload token" }, 403);
	}

	const contentLength = Number(c.req.header("content-length") ?? "0");
	if (contentLength > MAX_FILE_SIZE) {
		return c.json({ error: "File too large (max 10 MB)" }, 413);
	}

	const contentType =
		c.req.header("content-type") ?? "application/octet-stream";
	const body = await c.req.arrayBuffer();

	if (body.byteLength > MAX_FILE_SIZE) {
		return c.json({ error: "File too large (max 10 MB)" }, 413);
	}

	const bucket = getBucket();
	await bucket.put(pending.key, body, {
		httpMetadata: { contentType },
	});

	return c.json({ key: pending.key });
});

r2Routes.get("/file/:key{.+}", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const key = c.req.param("key");
	const bucket = getBucket();

	const object = await bucket.get(key);
	if (!object) {
		return c.json({ error: "File not found" }, 404);
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "private, max-age=3600");

	return new Response(object.body, { headers });
});

r2Routes.delete("/file/:key{.+}", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const key = c.req.param("key");
	const bucket = getBucket();

	await bucket.delete(key);
	return c.json({ success: true });
});

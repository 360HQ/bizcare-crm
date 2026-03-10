import { db, uploadToken } from "@bizcare-crm/db";
import { and, eq, gt } from "drizzle-orm";

const UPLOAD_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function createUploadToken(
	organizationId: string,
	key: string
): Promise<string> {
	const id = crypto.randomUUID();
	await db.insert(uploadToken).values({
		id,
		organizationId,
		key,
		expiresAt: new Date(Date.now() + UPLOAD_TOKEN_TTL_MS),
	});
	return id;
}

export async function consumeUploadToken(
	tokenId: string
): Promise<{ organizationId: string; key: string } | null> {
	const [row] = await db
		.delete(uploadToken)
		.where(
			and(eq(uploadToken.id, tokenId), gt(uploadToken.expiresAt, new Date()))
		)
		.returning({
			organizationId: uploadToken.organizationId,
			key: uploadToken.key,
		});

	return row ?? null;
}

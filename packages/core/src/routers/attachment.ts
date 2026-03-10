import { attachment, db } from "@bizcare-crm/db";
import { orgProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createUploadToken } from "../services/upload-token";

export const attachmentRouter = router({
	requestUpload: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
				fileName: z.string(),
				fileType: z.string().nullish(),
				fileSize: z.number().nullish(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();
			const key = `${ctx.organizationId}/${input.entityType}/${input.entityId}/${id}/${input.fileName}`;
			const token = await createUploadToken(ctx.organizationId, key);

			await db.insert(attachment).values({
				id,
				organizationId: ctx.organizationId,
				entityType: input.entityType,
				entityId: input.entityId,
				fileName: input.fileName,
				fileUrl: key,
				fileType: input.fileType ?? null,
				fileSize: input.fileSize ?? null,
				uploadedBy: ctx.session.user.id,
			});

			return { id, uploadToken: token, key };
		}),

	create: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
				fileName: z.string(),
				fileUrl: z.string(),
				fileType: z.string().nullish(),
				fileSize: z.number().nullish(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await db.insert(attachment).values({
				id,
				organizationId: ctx.organizationId,
				entityType: input.entityType,
				entityId: input.entityId,
				fileName: input.fileName,
				fileUrl: input.fileUrl,
				fileType: input.fileType ?? null,
				fileSize: input.fileSize ?? null,
				uploadedBy: ctx.session.user.id,
			});

			return { id };
		}),

	list: orgProcedure
		.input(
			z.object({
				entityType: z.string(),
				entityId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await db
				.select()
				.from(attachment)
				.where(
					and(
						eq(attachment.organizationId, ctx.organizationId),
						eq(attachment.entityType, input.entityType),
						eq(attachment.entityId, input.entityId)
					)
				)
				.limit(100);
		}),

	delete: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await db
				.delete(attachment)
				.where(
					and(
						eq(attachment.id, input.id),
						eq(attachment.organizationId, ctx.organizationId)
					)
				)
				.returning();

			if (!deleted) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Attachment not found",
				});
			}

			return { success: true };
		}),
});

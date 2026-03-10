import { db, memorial, memorialCategory } from "@bizcare-crm/db";
import { publicProcedure, router } from "@bizcare-crm/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

export const publicRouter = router({
	search: publicProcedure
		.input(
			z.object({
				organizationId: z.string(),
				query: z.string().optional(),
				categoryId: z.string().optional(),
				cursor: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
			})
		)
		.query(async ({ input }) => {
			const conditions = [
				eq(memorial.organizationId, input.organizationId),
				eq(memorial.isPublic, true),
			];

			if (input.query) {
				const term = `%${input.query}%`;
				conditions.push(
					or(
						ilike(memorial.nameEn, term),
						ilike(memorial.nameZh, term),
						ilike(memorial.serialNumber, term)
					) ?? sql`true`
				);
			}
			if (input.categoryId) {
				conditions.push(eq(memorial.categoryId, input.categoryId));
			}
			if (input.cursor) {
				conditions.push(sql`${memorial.id} > ${input.cursor}`);
			}

			const items = await db
				.select({
					id: memorial.id,
					nameEn: memorial.nameEn,
					nameZh: memorial.nameZh,
					photo: memorial.photo,
					publicSlug: memorial.publicSlug,
					location: memorial.location,
					categoryId: memorial.categoryId,
					categoryNameEn: memorialCategory.nameEn,
					categoryNameZh: memorialCategory.nameZh,
				})
				.from(memorial)
				.leftJoin(
					memorialCategory,
					eq(memorial.categoryId, memorialCategory.id)
				)
				.where(and(...conditions))
				.orderBy(memorial.id)
				.limit(input.limit + 1);

			const hasMore = items.length > input.limit;
			if (hasMore) {
				items.pop();
			}

			return {
				items,
				nextCursor: hasMore ? items.at(-1)?.id : null,
			};
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const [result] = await db
				.select({
					id: memorial.id,
					nameEn: memorial.nameEn,
					nameZh: memorial.nameZh,
					gender: memorial.gender,
					dateOfBirth: memorial.dateOfBirth,
					dateOfBirthLunar: memorial.dateOfBirthLunar,
					dateOfDeath: memorial.dateOfDeath,
					dateOfDeathLunar: memorial.dateOfDeathLunar,
					familyOrigin: memorial.familyOrigin,
					location: memorial.location,
					photo: memorial.photo,
					publicSlug: memorial.publicSlug,
					categoryNameEn: memorialCategory.nameEn,
					categoryNameZh: memorialCategory.nameZh,
				})
				.from(memorial)
				.leftJoin(
					memorialCategory,
					eq(memorial.categoryId, memorialCategory.id)
				)
				.where(
					and(eq(memorial.publicSlug, input.slug), eq(memorial.isPublic, true))
				)
				.limit(1);

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Memorial not found",
				});
			}

			return result;
		}),

	categories: publicProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ input }) => {
			return await db
				.select({
					id: memorialCategory.id,
					nameEn: memorialCategory.nameEn,
					nameZh: memorialCategory.nameZh,
				})
				.from(memorialCategory)
				.where(eq(memorialCategory.organizationId, input.organizationId))
				.limit(100);
		}),
});

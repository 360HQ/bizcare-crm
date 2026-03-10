import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "../core/organization";

export const memorialCategory = pgTable("memorial_category", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	nameEn: text("name_en"),
	nameZh: text("name_zh"),
	locationFormat: text("location_format"),
	position: integer("position").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const memorialCategoryRelations = relations(
	memorialCategory,
	({ one }) => ({
		organization: one(organization, {
			fields: [memorialCategory.organizationId],
			references: [organization.id],
		}),
	})
);

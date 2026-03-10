import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const tag = pgTable(
	"tag",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		unique("tag_org_name_unique").on(table.organizationId, table.name),
	]
);

export const taggable = pgTable(
	"taggable",
	{
		id: text("id").primaryKey(),
		tagId: text("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		unique("taggable_unique").on(table.tagId, table.entityType, table.entityId),
		index("taggable_entity_idx").on(table.entityType, table.entityId),
	]
);

export const tagRelations = relations(tag, ({ one, many }) => ({
	organization: one(organization, {
		fields: [tag.organizationId],
		references: [organization.id],
	}),
	taggables: many(taggable),
}));

export const taggableRelations = relations(taggable, ({ one }) => ({
	tag: one(tag, {
		fields: [taggable.tagId],
		references: [tag.id],
	}),
}));

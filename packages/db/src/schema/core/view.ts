import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { organization } from "./organization";

export const savedView = pgTable(
	"saved_view",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		filters: jsonb("filters").$type<Record<string, unknown>[]>().default([]),
		sortBy: jsonb("sort_by").$type<Record<string, unknown>>(),
		columns: jsonb("columns").$type<string[]>(),
		isDefault: boolean("is_default").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("saved_view_org_module_idx").on(table.organizationId, table.moduleId),
		index("saved_view_user_idx").on(table.userId),
	]
);

export const savedViewRelations = relations(savedView, ({ one }) => ({
	organization: one(organization, {
		fields: [savedView.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [savedView.userId],
		references: [user.id],
	}),
}));

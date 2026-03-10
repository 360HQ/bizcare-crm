import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { organization } from "./organization";

export const note = pgTable(
	"note",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),
		content: text("content").notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("note_entity_idx").on(table.entityType, table.entityId)]
);

export const noteRelations = relations(note, ({ one }) => ({
	organization: one(organization, {
		fields: [note.organizationId],
		references: [organization.id],
	}),
	author: one(user, {
		fields: [note.authorId],
		references: [user.id],
	}),
}));

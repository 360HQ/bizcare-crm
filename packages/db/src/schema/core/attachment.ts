import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { organization } from "./organization";

export const attachment = pgTable(
	"attachment",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),
		fileName: text("file_name").notNull(),
		fileUrl: text("file_url").notNull(),
		fileType: text("file_type"),
		fileSize: integer("file_size"),
		uploadedBy: text("uploaded_by").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("attachment_entity_idx").on(table.entityType, table.entityId),
	]
);

export const attachmentRelations = relations(attachment, ({ one }) => ({
	organization: one(organization, {
		fields: [attachment.organizationId],
		references: [organization.id],
	}),
	uploader: one(user, {
		fields: [attachment.uploadedBy],
		references: [user.id],
	}),
}));

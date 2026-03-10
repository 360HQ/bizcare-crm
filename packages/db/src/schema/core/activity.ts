import { relations } from "drizzle-orm";
import {
	index,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { contact } from "./contact";
import { organization } from "./organization";
import { record } from "./record";

export const activity = pgTable(
	"activity",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id"),
		recordId: text("record_id").references(() => record.id, {
			onDelete: "set null",
		}),
		contactId: text("contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		actorId: text("actor_id").references(() => user.id, {
			onDelete: "set null",
		}),
		type: text("type").notNull(),
		description: text("description"),
		numericValue: numeric("numeric_value"),
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("activity_org_created_idx").on(table.organizationId, table.createdAt),
		index("activity_contact_idx").on(table.contactId, table.createdAt),
		index("activity_record_idx").on(table.recordId),
	]
);

export const activityRelations = relations(activity, ({ one }) => ({
	organization: one(organization, {
		fields: [activity.organizationId],
		references: [organization.id],
	}),
	record: one(record, {
		fields: [activity.recordId],
		references: [record.id],
	}),
	contact: one(contact, {
		fields: [activity.contactId],
		references: [contact.id],
	}),
	actor: one(user, {
		fields: [activity.actorId],
		references: [user.id],
	}),
}));

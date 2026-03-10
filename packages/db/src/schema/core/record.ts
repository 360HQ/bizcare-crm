import { relations } from "drizzle-orm";
import {
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { contact } from "./contact";
import { organization } from "./organization";
import { pipelineStage } from "./pipeline";

export const record = pgTable(
	"record",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id").notNull(),
		pipelineStageId: text("pipeline_stage_id").references(
			() => pipelineStage.id
		),
		title: text("title"),
		customFields: jsonb("custom_fields")
			.$type<Record<string, unknown>>()
			.default({}),
		createdBy: text("created_by").references(() => user.id),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("record_org_module_idx").on(table.organizationId, table.moduleId),
	]
);

export const recordContact = pgTable(
	"record_contact",
	{
		id: text("id").primaryKey(),
		recordId: text("record_id")
			.notNull()
			.references(() => record.id, { onDelete: "cascade" }),
		contactId: text("contact_id")
			.notNull()
			.references(() => contact.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		isPrimary: text("is_primary").default("false"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		unique("record_contact_role_unique").on(
			table.recordId,
			table.contactId,
			table.role
		),
		index("record_contact_record_idx").on(table.recordId),
		index("record_contact_contact_idx").on(table.contactId),
	]
);

export const recordRelations = relations(record, ({ one, many }) => ({
	organization: one(organization, {
		fields: [record.organizationId],
		references: [organization.id],
	}),
	pipelineStage: one(pipelineStage, {
		fields: [record.pipelineStageId],
		references: [pipelineStage.id],
	}),
	createdByUser: one(user, {
		fields: [record.createdBy],
		references: [user.id],
	}),
	contacts: many(recordContact),
}));

export const recordContactRelations = relations(recordContact, ({ one }) => ({
	record: one(record, {
		fields: [recordContact.recordId],
		references: [record.id],
	}),
	contact: one(contact, {
		fields: [recordContact.contactId],
		references: [contact.id],
	}),
}));

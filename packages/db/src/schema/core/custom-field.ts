import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const customFieldDefinition = pgTable(
	"custom_field_definition",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id").notNull(),
		entityType: text("entity_type").notNull(),
		fieldKey: text("field_key").notNull(),
		labelEn: text("label_en"),
		labelZh: text("label_zh"),
		fieldType: text("field_type").notNull(),
		options: jsonb("options")
			.$type<{ value: string; labelEn: string; labelZh: string }[]>()
			.default([]),
		isRequired: boolean("is_required").default(false).notNull(),
		position: integer("position").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		unique("custom_field_def_unique").on(
			table.organizationId,
			table.moduleId,
			table.entityType,
			table.fieldKey
		),
	]
);

export const customFieldDefinitionRelations = relations(
	customFieldDefinition,
	({ one }) => ({
		organization: one(organization, {
			fields: [customFieldDefinition.organizationId],
			references: [organization.id],
		}),
	})
);

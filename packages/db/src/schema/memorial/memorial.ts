import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "../core/organization";
import { record } from "../core/record";
import { memorialCategory } from "./memorial-category";

export const memorial = pgTable(
	"memorial",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		recordId: text("record_id")
			.notNull()
			.unique()
			.references(() => record.id, { onDelete: "cascade" }),
		categoryId: text("category_id").references(() => memorialCategory.id, {
			onDelete: "set null",
		}),
		serialNumber: text("serial_number"),
		location: text("location"),
		nameEn: text("name_en"),
		nameZh: text("name_zh"),
		gender: text("gender"),
		nric: text("nric"),
		dateOfBirth: date("date_of_birth"),
		dateOfBirthLunar: text("date_of_birth_lunar"),
		dateOfDeath: date("date_of_death"),
		dateOfDeathLunar: text("date_of_death_lunar"),
		familyOrigin: text("family_origin"),
		internmentStatus: text("internment_status"),
		memorialServiceDate: date("memorial_service_date"),
		publicSlug: text("public_slug").unique(),
		isPublic: boolean("is_public").default(false).notNull(),
		photo: text("photo"),
		customFields: jsonb("custom_fields")
			.$type<Record<string, unknown>>()
			.default({}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("memorial_org_name_en_idx").on(table.organizationId, table.nameEn),
		index("memorial_org_name_zh_idx").on(table.organizationId, table.nameZh),
		index("memorial_org_location_idx").on(table.organizationId, table.location),
		index("memorial_public_slug_idx").on(table.publicSlug),
	]
);

export const memorialRelations = relations(memorial, ({ one }) => ({
	organization: one(organization, {
		fields: [memorial.organizationId],
		references: [organization.id],
	}),
	record: one(record, {
		fields: [memorial.recordId],
		references: [record.id],
	}),
	category: one(memorialCategory, {
		fields: [memorial.categoryId],
		references: [memorialCategory.id],
	}),
}));

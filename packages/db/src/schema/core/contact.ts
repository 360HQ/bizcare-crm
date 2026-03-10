import { relations } from "drizzle-orm";
import {
	date,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const contact = pgTable(
	"contact",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		type: text("type").notNull().default("individual"),
		nameEn: text("name_en"),
		nameZh: text("name_zh"),
		email: text("email"),
		phone: text("phone"),
		gender: text("gender"),
		nric: text("nric"),
		addressLine1: text("address_line_1"),
		addressLine2: text("address_line_2"),
		city: text("city"),
		state: text("state"),
		postalCode: text("postal_code"),
		country: text("country"),
		dateOfBirth: date("date_of_birth"),
		dateOfBirthLunar: text("date_of_birth_lunar"),
		familyOrigin: text("family_origin"),
		profileImage: text("profile_image"),
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
		index("contact_org_idx").on(table.organizationId),
		index("contact_org_name_en_idx").on(table.organizationId, table.nameEn),
		index("contact_org_name_zh_idx").on(table.organizationId, table.nameZh),
	]
);

export const contactRelations = relations(contact, ({ one }) => ({
	organization: one(organization, {
		fields: [contact.organizationId],
		references: [organization.id],
	}),
}));

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

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
	enabledModules: jsonb("enabled_modules").$type<string[]>().default([]),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const organizationMember = pgTable(
	"organization_member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("member"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		unique("org_member_unique").on(table.organizationId, table.userId),
		index("org_member_org_idx").on(table.organizationId),
		index("org_member_user_idx").on(table.userId),
	]
);

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(organizationMember),
}));

export const organizationMemberRelations = relations(
	organizationMember,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationMember.organizationId],
			references: [organization.id],
		}),
		user: one(user, {
			fields: [organizationMember.userId],
			references: [user.id],
		}),
	})
);

import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { contact } from "../core/contact";
import { memorial } from "./memorial";

export const memorialClaim = pgTable(
	"memorial_claim",
	{
		id: text("id").primaryKey(),
		memorialId: text("memorial_id")
			.notNull()
			.references(() => memorial.id, { onDelete: "cascade" }),
		fullName: text("full_name").notNull(),
		relationship: text("relationship").notNull(),
		nric: text("nric"),
		phone: text("phone"),
		email: text("email"),
		status: text("status").notNull().default("confirmed"),
		contactId: text("contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("memorial_claim_memorial_idx").on(table.memorialId)]
);

export const memorialClaimRelations = relations(memorialClaim, ({ one }) => ({
	memorial: one(memorial, {
		fields: [memorialClaim.memorialId],
		references: [memorial.id],
	}),
	contact: one(contact, {
		fields: [memorialClaim.contactId],
		references: [contact.id],
	}),
}));

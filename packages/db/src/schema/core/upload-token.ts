import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const uploadToken = pgTable("upload_token", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id").notNull(),
	key: text("key").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

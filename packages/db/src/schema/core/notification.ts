import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const notificationRule = pgTable(
	"notification_rule",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id"),
		triggerEvent: text("trigger_event").notNull(),
		channel: text("channel").notNull().default("in_app"),
		recipientType: text("recipient_type").notNull(),
		recipientId: text("recipient_id"),
		messageTemplate: text("message_template"),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("notification_rule_org_idx").on(table.organizationId)]
);

export const notificationLog = pgTable(
	"notification_log",
	{
		id: text("id").primaryKey(),
		ruleId: text("rule_id").references(() => notificationRule.id, {
			onDelete: "set null",
		}),
		recipientEmail: text("recipient_email"),
		recipientPhone: text("recipient_phone"),
		channel: text("channel").notNull(),
		status: text("status").notNull().default("pending"),
		sentAt: timestamp("sent_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("notification_log_rule_idx").on(table.ruleId)]
);

export const notificationRuleRelations = relations(
	notificationRule,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [notificationRule.organizationId],
			references: [organization.id],
		}),
		logs: many(notificationLog),
	})
);

export const notificationLogRelations = relations(
	notificationLog,
	({ one }) => ({
		rule: one(notificationRule, {
			fields: [notificationLog.ruleId],
			references: [notificationRule.id],
		}),
	})
);

import { db, notificationLog, notificationRule } from "@bizcare-crm/db";
import { and, eq } from "drizzle-orm";

interface ActivityEvent {
	actorId?: string;
	contactId?: string;
	description?: string;
	moduleId?: string;
	organizationId: string;
	recordId?: string;
	type: string;
}

export async function evaluateNotificationRules(event: ActivityEvent) {
	const conditions = [
		eq(notificationRule.organizationId, event.organizationId),
		eq(notificationRule.triggerEvent, event.type),
		eq(notificationRule.isActive, true),
	];

	if (event.moduleId) {
		conditions.push(eq(notificationRule.moduleId, event.moduleId));
	}

	const rules = await db
		.select()
		.from(notificationRule)
		.where(and(...conditions));

	for (const rule of rules) {
		await db.insert(notificationLog).values({
			id: crypto.randomUUID(),
			ruleId: rule.id,
			channel: rule.channel,
			status: rule.channel === "in_app" ? "delivered" : "pending",
			sentAt: rule.channel === "in_app" ? new Date() : null,
		});
	}

	return rules.length;
}

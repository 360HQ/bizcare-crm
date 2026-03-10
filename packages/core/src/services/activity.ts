import { activity, db } from "@bizcare-crm/db";
import { evaluateNotificationRules } from "./notification";

interface LogActivityInput {
	actorId?: string;
	contactId?: string;
	description?: string;
	metadata?: Record<string, unknown>;
	moduleId?: string;
	numericValue?: string;
	organizationId: string;
	recordId?: string;
	type: string;
}

export async function logActivity(input: LogActivityInput) {
	const id = crypto.randomUUID();
	await db.insert(activity).values({
		id,
		organizationId: input.organizationId,
		moduleId: input.moduleId ?? null,
		recordId: input.recordId ?? null,
		contactId: input.contactId ?? null,
		actorId: input.actorId ?? null,
		type: input.type,
		description: input.description ?? null,
		numericValue: input.numericValue ?? null,
		metadata: input.metadata ?? {},
	});

	await evaluateNotificationRules({
		organizationId: input.organizationId,
		moduleId: input.moduleId,
		type: input.type,
		recordId: input.recordId,
		contactId: input.contactId,
		actorId: input.actorId,
		description: input.description,
	});

	return id;
}

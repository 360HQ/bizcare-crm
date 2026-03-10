import { router } from "@bizcare-crm/trpc";
import { activityRouter } from "./activity";
import { attachmentRouter } from "./attachment";
import { contactRouter } from "./contact";
import { customFieldRouter } from "./custom-field";
import { noteRouter } from "./note";
import { notificationRouter } from "./notification";
import { organizationRouter } from "./organization";
import { pipelineRouter } from "./pipeline";
import { recordRouter } from "./record";
import { tagRouter } from "./tag";
import { viewRouter } from "./view";

export const coreRouter = router({
	organization: organizationRouter,
	contact: contactRouter,
	record: recordRouter,
	pipeline: pipelineRouter,
	tag: tagRouter,
	activity: activityRouter,
	note: noteRouter,
	attachment: attachmentRouter,
	view: viewRouter,
	customField: customFieldRouter,
	notification: notificationRouter,
});

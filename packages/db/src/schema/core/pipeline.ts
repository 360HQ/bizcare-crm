import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const pipeline = pgTable(
	"pipeline",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		moduleId: text("module_id").notNull(),
		name: text("name").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		unique("pipeline_org_module_unique").on(
			table.organizationId,
			table.moduleId
		),
	]
);

export const pipelineStage = pgTable(
	"pipeline_stage",
	{
		id: text("id").primaryKey(),
		pipelineId: text("pipeline_id")
			.notNull()
			.references(() => pipeline.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color"),
		position: integer("position").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("pipeline_stage_pipeline_idx").on(table.pipelineId)]
);

export const pipelineRelations = relations(pipeline, ({ one, many }) => ({
	organization: one(organization, {
		fields: [pipeline.organizationId],
		references: [organization.id],
	}),
	stages: many(pipelineStage),
}));

export const pipelineStageRelations = relations(pipelineStage, ({ one }) => ({
	pipeline: one(pipeline, {
		fields: [pipelineStage.pipelineId],
		references: [pipeline.id],
	}),
}));

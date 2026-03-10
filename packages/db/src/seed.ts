import { resolve } from "node:path";
import dotenv from "dotenv";

// Load environment variables from the server's .env file
dotenv.config({
	path: resolve(process.cwd(), "../../apps/server/.env"),
	override: true,
});

async function main() {
	console.log("🌱 Seeding database...");

	const { db } = await import("./index");
	const {
		contact,
		memorial,
		memorialCategory,
		organization,
		organizationMember,
		pipeline,
		pipelineStage,
		record,
		user,
	} = await import("./schema");

	// 1. Create Organization
	const orgId = "org_dev_123";
	await db
		.insert(organization)
		.values({
			id: orgId,
			name: "BizCare CRM Dev",
			slug: "bizcare-dev",
			enabledModules: ["memorial", "contacts", "pipelines"],
		})
		.onConflictDoNothing();

	console.log("✅ Organization created");

	// 2. Create Admin User
	const adminId = "user_admin_dev";
	await db
		.insert(user)
		.values({
			id: adminId,
			name: "Admin User",
			email: "admin@example.com",
			emailVerified: true,
		})
		.onConflictDoNothing();

	await db
		.insert(organizationMember)
		.values({
			id: "mem_admin_dev",
			organizationId: orgId,
			userId: adminId,
			role: "admin",
		})
		.onConflictDoNothing();

	console.log("✅ Admin user created");

	// 3. Create Regular User
	const userId = "user_dev_001";
	await db
		.insert(user)
		.values({
			id: userId,
			name: "Dev User",
			email: "dev@example.com",
			emailVerified: true,
		})
		.onConflictDoNothing();

	await db
		.insert(organizationMember)
		.values({
			id: "mem_dev_001",
			organizationId: orgId,
			userId,
			role: "member",
		})
		.onConflictDoNothing();

	console.log("✅ Regular user created");

	// 4. Create some contacts
	const contactId = "contact_dev_001";
	await db
		.insert(contact)
		.values({
			id: contactId,
			organizationId: orgId,
			nameEn: "John Doe",
			nameZh: "张三",
			email: "john.doe@example.com",
			phone: "+65 8888 8888",
			type: "individual",
		})
		.onConflictDoNothing();

	console.log("✅ Sample contact created");

	// 5. Create Pipeline and Stages
	const pipelineId = "pipe_dev_001";
	await db
		.insert(pipeline)
		.values({
			id: pipelineId,
			organizationId: orgId,
			moduleId: "memorial",
			name: "Memorial Service Pipeline",
		})
		.onConflictDoNothing();

	const stageIds = ["stage_new", "stage_ready", "stage_completed"];
	const stages = [
		{ id: stageIds[0], name: "New Request", position: 0 },
		{ id: stageIds[1], name: "Ready for Service", position: 1 },
		{ id: stageIds[2], name: "Completed", position: 2 },
	];

	for (const stage of stages) {
		await db
			.insert(pipelineStage)
			.values({
				id: stage.id,
				pipelineId,
				name: stage.name,
				position: stage.position,
			})
			.onConflictDoNothing();
	}

	console.log("✅ Pipeline and stages created");

	// 6. Create Memorial Category
	const categoryId = "cat_dev_001";
	await db
		.insert(memorialCategory)
		.values({
			id: categoryId,
			organizationId: orgId,
			nameEn: "Standard Memorial",
			nameZh: "标准纪念",
		})
		.onConflictDoNothing();

	console.log("✅ Memorial category created");

	// 7. Create a Record and Memorial
	const recordId = "rec_dev_001";
	await db
		.insert(record)
		.values({
			id: recordId,
			organizationId: orgId,
			moduleId: "memorial",
			pipelineStageId: stageIds[0],
			title: "Memorial for Jane Smith",
			createdBy: adminId,
		})
		.onConflictDoNothing();

	await db
		.insert(memorial)
		.values({
			id: "mem_dev_001",
			organizationId: orgId,
			recordId,
			categoryId,
			nameEn: "Jane Smith",
			nameZh: "李四",
			location: "Garden A - Plot 123",
			isPublic: true,
			publicSlug: "jane-smith-123",
		})
		.onConflictDoNothing();

	console.log("✅ Sample record and memorial created");

	console.log("🚀 Seeding completed successfully!");
	process.exit(0);
}

main().catch((err) => {
	console.error("❌ Seeding failed:", err);
	process.exit(1);
});

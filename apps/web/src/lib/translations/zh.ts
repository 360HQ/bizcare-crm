import type { en } from "./en";

export const zh: Record<keyof typeof en, string> = {
	// Nav
	"nav.dashboard": "仪表板",
	"nav.contacts": "联络人",
	"nav.memorials": "追思册",
	"nav.tags": "标签",
	"nav.settings": "设置",
	"nav.categories": "类别",

	// Common
	"common.save": "保存",
	"common.cancel": "取消",
	"common.create": "创建",
	"common.edit": "编辑",
	"common.delete": "删除",
	"common.search": "搜索",
	"common.loading": "加载中...",
	"common.noResults": "未找到结果",
	"common.actions": "操作",
	"common.name": "名称",
	"common.status": "状态",
	"common.back": "返回",
	"common.next": "下一步",
	"common.previous": "上一步",
	"common.confirm": "确认",
	"common.review": "审核",

	// Auth
	"auth.signIn": "登录",
	"auth.signOut": "登出",

	// Org
	"org.select": "选择组织",
	"org.create": "创建组织",
	"org.name": "组织名称",
	"org.slug": "代号",
	"org.settings": "组织设置",

	// Contacts
	"contacts.title": "联络人",
	"contacts.add": "添加联络人",
	"contacts.nameEn": "姓名 (英文)",
	"contacts.nameZh": "姓名 (中文)",
	"contacts.email": "电邮",
	"contacts.phone": "电话",
	"contacts.type": "类型",
	"contacts.search": "搜索联络人...",

	// Memorials
	"memorials.title": "追思册",
	"memorials.add": "添加追思记录",
	"memorials.nameEn": "姓名 (英文)",
	"memorials.nameZh": "姓名 (中文)",
	"memorials.serialNumber": "编号",
	"memorials.location": "位置",
	"memorials.category": "类别",
	"memorials.gender": "性别",
	"memorials.nric": "身份证号",
	"memorials.dateOfBirth": "出生日期",
	"memorials.dateOfBirthLunar": "出生日期 (农历)",
	"memorials.dateOfDeath": "逝世日期",
	"memorials.dateOfDeathLunar": "逝世日期 (农历)",
	"memorials.familyOrigin": "籍贯",
	"memorials.internmentStatus": "安置状态",
	"memorials.memorialServiceDate": "追思法会日期",
	"memorials.photo": "照片网址",
	"memorials.isPublic": "公开",
	"memorials.search": "搜索追思册...",
	"memorials.noMemorials": "未找到追思记录",
	"memorials.created": "追思记录已创建",
	"memorials.updated": "追思记录已更新",
	"memorials.deleted": "追思记录已删除",

	// Memorial form steps
	"memorials.step.deceased": "逝者信息",
	"memorials.step.details": "详细信息",
	"memorials.step.category": "类别与位置",
	"memorials.step.review": "审核",

	// Categories
	"categories.title": "追思册类别",
	"categories.add": "添加类别",
	"categories.nameEn": "名称 (英文)",
	"categories.nameZh": "名称 (中文)",
	"categories.locationFormat": "位置格式",
	"categories.position": "排序",
	"categories.created": "类别已创建",
	"categories.updated": "类别已更新",
	"categories.deleted": "类别已删除",
	"categories.noCategories": "未找到类别",

	// Dashboard
	"dashboard.title": "仪表板",
	"dashboard.contacts": "联络人",
	"dashboard.recentActivity": "最近活动",
	"dashboard.noActivity": "暂无活动",

	// Activity
	"activity.title": "活动",
	"activity.noActivity": "暂无活动",

	// Settings
	"settings.title": "设置",
	"settings.notifications": "通知",
	"settings.customFields": "自定义字段",
	"settings.notificationsDesc": "配置事件发生时的自动通知。",
	"settings.customFieldsDesc": "为每个模块定义自定义字段。",

	// Views
	"views.allRecords": "所有记录",
	"views.saveView": "保存视图",
	"views.viewName": "视图名称",
	"views.saved": "视图已保存",
	"views.deleted": "视图已删除",
};

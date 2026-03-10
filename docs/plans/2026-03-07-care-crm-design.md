# BizCARE CRM Platform — Design Document

> **Date:** 2026-03-07
> **Status:** Draft — pending final review
> **First module:** Memorial Registry (Chinese Buddhist temples)
> **Second module:** Clan Association member registry (future)

---

## 1. Vision

BizCARE CRM is a **customizable CRM engine** that serves as the foundation for all CARE Business Apps products. It is not a single-purpose app — it is a set of reusable building blocks that any CARE product can consume.

Products that use the CRM engine:

- **Memorial Registry** — CRM configured for deceased registrants + families (first case study)
- **Clan Association** — CRM configured for members + lineage (second case study)
- **DonorCARE** — CRM configured for donors + donations + fundraising
- **TicketCARE** — CRM configured for events + attendees + ticketing
- **Procurement Intelligence** — CRM configured for suppliers + vendors

Each product gets contact management, custom fields, activity tracking, multi-tenancy, and all other building blocks **for free**. Modules only add their own domain-specific tables and business logic.

The **cross-product intelligence layer** means value compounds: a single family contact appears across memorials, donations, events, and more — giving organizations a complete 360-degree view of their relationships.

---

## 2. Tech Stack

Already set up in the monorepo:

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + Bun workspaces |
| Backend | Hono + tRPC |
| Auth | Better Auth (email/password) |
| Database | Drizzle ORM + Neon Postgres (serverless) |
| Frontend | React 19 + Vite + TanStack Router + TanStack Query + shadcn/ui + Tailwind v4 |
| Infrastructure | Alchemy (Cloudflare Workers) |
| Linting | Ultracite / Biome |
| PWA | vite-plugin-pwa |

---

## 3. Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Multi-tenancy | Row-level isolation with `organizationId` | Simplest to operate, cheapest, enables cross-product intelligence since all data is co-located. Enforced via middleware. |
| Organization model | One user, many orgs with role-per-org | Users can belong to multiple organizations (e.g., volunteer at two temples). `organization_member` join table with `role` column. |
| Custom fields | Hybrid — explicit columns for core fields + JSONB for tenant-specific extras | Core fields get proper indexing and type safety. Custom fields are defined in a `custom_field_definition` table per org, driving dynamic form rendering. |
| Intelligence layer | Shared contact registry + unified activity timeline | All modules reference the same `contact` table. A shared `activity` table captures typed events across modules. Schema designed to support scoring/analytics later (typed categories, numeric values, metadata JSONB). |
| Public memorial | Digital memorial permalink + QR code | Each memorial gets a unique URL. QR codes printed on physical niches. Family members can share via WhatsApp. |
| Descendant linking | Trust-based self-service with confirmation steps | No admin approval needed — nobody claims an unknown ancestor. Multi-step confirmation for data quality. |
| Product categories | Configurable per-org catalog | Temples define their own categories (pagoda niche, ancestral tablet, etc.) with configurable location formats. |
| i18n — data | Explicit `_en`/`_zh` columns for core fields, JSONB locale for custom fields | Core bilingual fields (name, address) need proper indexing for search. Custom fields store locale variants in JSONB. |
| i18n — UI | Standard i18n library | Chinese + English dual-language interface. |
| Location/slot | Text-based | Simple string field. DonorCARE handles the sales side; memorial registry just tracks where. |
| Module architecture | Module registry in monorepo packages | Core CRM in `packages/core`. Each module in `packages/modules/*` exports schema, tRPC routers, and React components. Orgs enable the modules they need. |

---

## 4. CRM Engine — 10 Building Blocks

The CRM engine provides 10 generic building blocks that every module inherits:

| # | Building Block | Purpose | Example |
|---|---|---|---|
| 1 | **Contact** | People and organizations you interact with | Family member, donor, vendor, clan member |
| 2 | **Record** | The domain-specific "thing" a module tracks | Memorial entry, donation, event, supplier listing |
| 3 | **Link** | Relationships between contacts and records | "Purchaser of memorial", "Donor of donation" |
| 4 | **Activity** | Timeline of what happened across all modules | "Donated RM500", "Linked as descendant" |
| 5 | **Tag** | Flexible categorization on anything | `[VIP]`, `[Monthly Donor]`, `[Overseas Family]` |
| 6 | **Attachment** | Files attached to any record or contact | Photos, certificates, receipts, documents |
| 7 | **Note** | Internal staff comments (private) | "Family requested niche cleaning before Qing Ming" |
| 8 | **Notification** | Configurable alerts via email/WhatsApp | "When descendant links, notify admin" |
| 9 | **Pipeline** | Status stages that records move through | Draft > Review > Published > Archived |
| 10 | **View** | Saved filters/sorts per user per org | "All pending photo uploads", "Added this month" |

Each module adds only 1-3 domain-specific tables. Everything else comes free from the engine.

---

## 5. Data Model

### 5.1 Core CRM Schema

#### Organization & Membership

```
organization
├── id                  text, PK
├── name                text
├── slug                text, unique (used in URLs)
├── logo                text (URL)
├── settings            jsonb (org-level preferences)
├── enabledModules      jsonb (array of module IDs: ["memorial", "clan", ...])
├── createdAt           timestamp
└── updatedAt           timestamp

organization_member
├── id                  text, PK
├── organizationId      text, FK → organization
├── userId              text, FK → user (from auth schema)
├── role                text ("owner", "admin", "member", "viewer")
├── createdAt           timestamp
└── updatedAt           timestamp
    UNIQUE(organizationId, userId)
```

#### Contact

The universal person/organization record shared across all modules.

```
contact
├── id                  text, PK
├── organizationId      text, FK → organization
├── type                text ("individual", "organization")
├── nameEn              text (English name)
├── nameZh              text (Chinese name)
├── email               text
├── phone               text
├── gender              text ("male", "female", "other")
├── nric                text (national ID)
├── addressLine1        text
├── addressLine2        text
├── city                text
├── state               text
├── postalCode          text
├── country             text
├── dateOfBirth         date
├── dateOfBirthLunar    text (lunar date as string, e.g., "辛未年十二月初五日")
├── familyOrigin        text (籍贯, e.g., "福建龙岩")
├── profileImage        text (URL)
├── customFields        jsonb (tenant-specific extra data)
├── createdAt           timestamp
└── updatedAt           timestamp
    INDEX on (organizationId)
    INDEX on (organizationId, nameEn)
    INDEX on (organizationId, nameZh)
```

#### Record

The generic "thing" that modules track. Each module extends this with its own table.

```
record
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text ("memorial", "clan", "donation", "event", ...)
├── pipelineStageId     text, FK → pipeline_stage (current status)
├── title               text (display name, e.g., "陈维成 Memorial" or "Tan Hooi Seng Membership")
├── customFields        jsonb
├── createdBy           text, FK → user
├── createdAt           timestamp
└── updatedAt           timestamp
    INDEX on (organizationId, moduleId)
```

#### Link (Record-Contact relationships)

```
record_contact
├── id                  text, PK
├── recordId            text, FK → record
├── contactId           text, FK → contact
├── role                text ("purchaser", "deceased", "descendant", "donor", "attendee", "vendor", ...)
├── isPrimary           boolean (is this the main contact for this record?)
├── createdAt           timestamp
└── updatedAt           timestamp
    UNIQUE(recordId, contactId, role)
```

#### Activity Log

```
activity
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text
├── recordId            text, FK → record (nullable)
├── contactId           text, FK → contact (nullable)
├── actorId             text, FK → user (who performed the action)
├── type                text ("record.created", "contact.linked", "donation.received", ...)
├── description         text (human-readable: "Donated RM500 to Vesak Fund")
├── numericValue        numeric (for future scoring: donation amount, attendance count, etc.)
├── metadata            jsonb (extra structured data per event type)
├── createdAt           timestamp
    INDEX on (organizationId, createdAt)
    INDEX on (contactId, createdAt)
    INDEX on (recordId)
```

#### Tag

```
tag
├── id                  text, PK
├── organizationId      text, FK → organization
├── name                text
├── color               text (hex color for UI)
├── createdAt           timestamp
    UNIQUE(organizationId, name)

taggable
├── id                  text, PK
├── tagId               text, FK → tag
├── entityType          text ("record", "contact", "activity")
├── entityId            text
├── createdAt           timestamp
    UNIQUE(tagId, entityType, entityId)
    INDEX on (entityType, entityId)
```

#### Attachment

```
attachment
├── id                  text, PK
├── organizationId      text, FK → organization
├── entityType          text ("record", "contact")
├── entityId            text
├── fileName            text
├── fileUrl             text
├── fileType            text (MIME type)
├── fileSize            integer (bytes)
├── uploadedBy          text, FK → user
├── createdAt           timestamp
    INDEX on (entityType, entityId)
```

#### Note

```
note
├── id                  text, PK
├── organizationId      text, FK → organization
├── entityType          text ("record", "contact")
├── entityId            text
├── content             text
├── authorId            text, FK → user
├── createdAt           timestamp
└── updatedAt           timestamp
    INDEX on (entityType, entityId)
```

#### Notification

```
notification_rule
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text
├── triggerEvent        text ("record.created", "contact.linked", "pipeline.stage_changed", ...)
├── channel             text ("email", "whatsapp", "in_app")
├── recipientType       text ("admin", "contact", "specific_user")
├── recipientId         text (nullable, for specific_user)
├── messageTemplate     text (with {{variable}} placeholders)
├── isActive            boolean
├── createdAt           timestamp
└── updatedAt           timestamp

notification_log
├── id                  text, PK
├── ruleId              text, FK → notification_rule
├── recipientEmail      text
├── recipientPhone      text
├── channel             text
├── status              text ("pending", "sent", "failed")
├── sentAt              timestamp
├── createdAt           timestamp
```

#### Pipeline

```
pipeline
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text
├── name                text (e.g., "Memorial Status", "Membership Flow")
├── createdAt           timestamp
└── updatedAt           timestamp
    UNIQUE(organizationId, moduleId)

pipeline_stage
├── id                  text, PK
├── pipelineId          text, FK → pipeline
├── name                text (e.g., "草稿 Draft")
├── color               text (hex)
├── position            integer (ordering)
├── createdAt           timestamp
└── updatedAt           timestamp
```

#### View

```
saved_view
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text
├── userId              text, FK → user (owner of the view)
├── name                text
├── filters             jsonb (array of filter conditions)
├── sortBy              jsonb
├── columns             jsonb (which columns to show)
├── isDefault           boolean
├── createdAt           timestamp
└── updatedAt           timestamp
```

#### Custom Field Definition

```
custom_field_definition
├── id                  text, PK
├── organizationId      text, FK → organization
├── moduleId            text (which module this field belongs to)
├── entityType          text ("record", "contact")
├── fieldKey            text (machine name, used as key in customFields JSONB)
├── labelEn             text
├── labelZh             text
├── fieldType           text ("text", "number", "date", "select", "multiselect", "boolean", "url")
├── options             jsonb (for select/multiselect: array of {value, labelEn, labelZh})
├── isRequired          boolean
├── position            integer (display order)
├── createdAt           timestamp
└── updatedAt           timestamp
    UNIQUE(organizationId, moduleId, entityType, fieldKey)
```

### 5.2 Memorial Registry Module Schema

This module adds only two tables on top of the CRM engine.

#### Memorial

The domain-specific extension of `record` for memorial entries.

```
memorial
├── id                  text, PK (same as record.id — 1:1 with record)
├── organizationId      text, FK → organization
├── recordId            text, FK → record, UNIQUE
├── categoryId          text, FK → memorial_category
├── serialNumber        text (temple's internal numbering)
├── location            text (e.g., "T堂B44", "A堂D03")
├── nameEn              text (deceased English name — denormalized for search)
├── nameZh              text (deceased Chinese name — denormalized for search)
├── gender              text
├── nric                text
├── dateOfBirth         date
├── dateOfBirthLunar    text
├── dateOfDeath         date
├── dateOfDeathLunar    text
├── familyOrigin        text (籍贯)
├── internmentStatus    text ("cremated", "buried", "pending", ...)
├── memorialServiceDate date
├── publicSlug          text, UNIQUE (for public permalink: /memorial/{slug})
├── isPublic            boolean (visible on public search)
├── photo               text (URL)
├── customFields        jsonb
├── createdAt           timestamp
└── updatedAt           timestamp
    INDEX on (organizationId, nameEn)
    INDEX on (organizationId, nameZh)
    INDEX on (organizationId, location)
    INDEX on (publicSlug)
```

#### Memorial Category

Configurable product types per organization.

```
memorial_category
├── id                  text, PK
├── organizationId      text, FK → organization
├── nameEn              text (e.g., "Pagoda Niche")
├── nameZh              text (e.g., "海会塔灵位")
├── locationFormat      text (description of format: "Hall-Row-Column")
├── position            integer (display order)
├── createdAt           timestamp
└── updatedAt           timestamp
```

#### Memorial Claim (Descendant Self-Service Linking)

```
memorial_claim
├── id                  text, PK
├── memorialId          text, FK → memorial
├── fullName            text
├── relationship        text ("son", "daughter", "grandchild", "spouse", ...)
├── nric                text
├── phone               text
├── email               text
├── status              text ("confirmed" — trust-based, multi-step confirmation)
├── contactId           text, FK → contact (created/linked upon confirmation)
├── createdAt           timestamp
└── updatedAt           timestamp
```

### 5.3 Clan Association Module Schema (Future)

Documented for schema compatibility — not built in v1.

```
clan_member
├── id                  text, PK
├── organizationId      text, FK → organization
├── recordId            text, FK → record, UNIQUE
├── contactId           text, FK → contact
├── generationNumber    integer (辈分 — which generation in the lineage)
├── generationName      text (字辈 — generation character)
├── familyUnitId        text, FK → clan_family_unit
├── membershipStatus    text
├── joinDate            date
├── customFields        jsonb
├── createdAt           timestamp
└── updatedAt           timestamp

clan_family_unit
├── id                  text, PK
├── organizationId      text, FK → organization
├── headMemberId        text, FK → clan_member
├── familyName          text
├── customFields        jsonb
├── createdAt           timestamp
└── updatedAt           timestamp

clan_lineage
├── id                  text, PK
├── organizationId      text, FK → organization
├── parentMemberId      text, FK → clan_member
├── childMemberId       text, FK → clan_member
├── relationshipType    text ("biological", "adopted", "married_in")
├── createdAt           timestamp
└── updatedAt           timestamp
    UNIQUE(parentMemberId, childMemberId)
```

---

## 6. Monorepo Structure

```
bizcare-crm/
├── apps/
│   ├── server/                  — Hono + tRPC API (Cloudflare Workers)
│   └── web/                     — React 19 + TanStack Router SPA
├── packages/
│   ├── core/                    — NEW: CRM engine building blocks
│   │   ├── src/
│   │   │   ├── schema/          — Drizzle schemas for all 10 building blocks
│   │   │   ├── routers/         — tRPC routers for contacts, records, tags, etc.
│   │   │   ├── services/        — Business logic (activity logging, notification dispatch)
│   │   │   └── components/      — Shared React components (tag picker, activity timeline, etc.)
│   │   └── package.json
│   ├── modules/
│   │   ├── memorial/            — NEW: Memorial Registry module
│   │   │   ├── src/
│   │   │   │   ├── schema/      — memorial, memorial_category, memorial_claim tables
│   │   │   │   ├── routers/     — memorial-specific tRPC routers
│   │   │   │   ├── components/  — Memorial form, public search, permalink page
│   │   │   │   └── index.ts     — Module registration (exports schema, routers, routes)
│   │   │   └── package.json
│   │   └── clan/                — FUTURE: Clan Association module
│   ├── api/                     — tRPC router aggregation (imports core + module routers)
│   ├── auth/                    — Better Auth
│   ├── db/                      — Drizzle ORM + Neon connection + all schemas
│   ├── env/                     — Environment validation
│   ├── config/                  — Shared TypeScript config
│   └── infra/                   — Alchemy / Cloudflare deployment
└── docs/
    └── plans/                   — Design documents (this file)
```

---

## 7. UI/UX Design

### 7.1 Admin Dashboard — "Calm Productivity"

**Design philosophy:** Temple admins are often volunteers, sometimes elderly. They are digitizing hundreds of paper records. The UI must feel unhurried, forgiving, and clear.

**Key patterns:**

- **Bilingual navigation** — Sidebar labels show both Chinese + English always (not toggled). The language toggle controls content and forms, not navigation.
- **Progressive data entry** — Multi-step form with auto-save as draft. Steps can be completed in any order. Registrant (deceased) first — that is the purpose of the record.
- **Dual-input fields** — Core bilingual fields (name, address) render side-by-side: Chinese on left, English on right. Not stacked.
- **Lunar/Western date picker** — Custom component that accepts either format and auto-converts. Legacy paper records often only have lunar dates.
- **Bulk import mode** — "Rapid Entry" mode for mass-digitizing paper records. Stripped-down form, tab-through, enter to save and start next.

**Layout:** Collapsible sidebar with bilingual labels. Top bar with org switcher, language toggle, notifications, user menu. Main content area with stat cards + recent records on dashboard.

**Color palette:** Warm, muted tones. Clean white + subtle warm gray + accent gold (temple-inspired). Not clinical blue SaaS.

### 7.2 Public Memorial Search — "Reverent Simplicity"

**Design philosophy:** This is a sacred space. Families are looking for deceased loved ones. The UI must feel respectful, warm, and serene.

**Key patterns:**

- **Instant search** — Debounced full-text search across both Chinese and English names. Results stream as you type. Postgres tsvector on name columns.
- **Category filter** — Filter by memorial category (pagoda niche, ancestral tablet, etc.).
- **Memorial permalink page** — Clean, portrait-oriented page: photo, name (bilingual), dates, family origin, location, category. QR code at bottom. "I am family" button for descendant linking.
- **QR code on physical niches** — Each memorial auto-generates a QR code. Temple prints stickers for niches. Family scans at temple, sees digital memorial on phone.
- **WhatsApp sharing** — Open Graph meta tags for rich previews. Share button with pre-filled WhatsApp message.
- **PWA + offline** — Public search works offline via service worker caching.

**Responsive strategy:**
- Admin: Desktop-first (data entry at counter/office), responsive to tablet.
- Public: Mobile-first (families on phones at temple or at home).

---

## 8. Nice-to-Have / Future Enhancements

- Interactive memorial page: authenticated family members add photos, stories, light virtual incense, leave messages
- Automated descendant verification: auto-match NRIC against existing family contacts
- Grid/map-based slot management for visual niche layout
- Structured location fields for filtering by hall/row/column
- Full analytics/scoring engine on the activity log
- Genealogy tree visualization for clan module
- Hierarchical organizations (federation > temples)
- Multi-language beyond Chinese/English (Malay, etc.)

---

## 9. Module How-It-Works Summary

Each CARE product (memorial, clan, donor, ticketing, procurement) adds only its domain-specific tables and logic. Everything else comes from the CRM engine:

| What the module provides | What the CRM engine provides for free |
|---|---|
| 1-3 domain tables | Contacts, records, links |
| Module-specific routes/UI | Activity log, tags, attachments |
| Business logic | Notes, notifications, pipelines |
| | Views, custom fields |
| | Multi-tenancy, auth, i18n |

**The compound effect:** Each new CARE product makes all existing products smarter. TicketCARE event attendance enriches DonorCARE donor profiles, which enriches Memorial Registry family insights. One contact, full 360-degree picture across all modules.

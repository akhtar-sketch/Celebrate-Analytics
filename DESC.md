# Paid Ads Analytics Dashboard — Celebrate Dental and Braces
## Project Overview

> **Implementation status as of 2026-06-12:** Dashboard, auth, and design system complete. Marketing data for **5 locations fully integrated** (San Antonio, Springfield, Las Vegas, Austin, New Mexico). Springfield includes Olathe/Kansas City (rolled up). Platform expansion plan (SEO + Social Media) designed and documented in `EXPANSION.md`.

This project is a custom-built paid advertising analytics dashboard designed to replace the current Madgicx reporting workflow with an internally managed platform.

The system automatically collects daily advertising data from multiple marketing platforms, stores it in Supabase, and renders live analytics dashboards per location and for the company as a whole.

The primary goal is to provide:
- Individual analytics dashboards per clinic/location, viewable for any date range
- A consolidated executive dashboard across all locations
- Real-time data updated daily via n8n ingestion workflows
- Cleaner and more customizable reporting than third-party platforms like Madgicx

The system is not intended to become a full business operating system or CRM platform. Its focus is specifically on paid ads reporting, visualization, attribution improvements, and executive presentation.

> **Note on scope evolution:** The original design called for quarterly snapshots. The implementation was refactored to **daily data ingestion** to support flexible date-range filtering (last 7 days, last month, custom ranges, etc.) — a significant improvement over fixed quarterly windows.

---

# Main Objectives

## 1. Replace Madgicx Quarterly Reporting

The current reporting process relies on Madgicx dashboards and presentations. The new system replaces this with a fully custom internal dashboard solution that:
- Matches or exceeds the visual quality of existing reports
- Allows complete customization
- Reduces dependency on external reporting platforms
- Gives full control over data and metrics
- Supports organization-specific KPIs

---

## 2. Automate Reporting

The system automatically ingests data daily and makes it available on-demand in the dashboard:
- One dashboard per location (any date range)
- One consolidated executive management dashboard

Data is pushed to Supabase daily via n8n and requires no manual work to refresh.

---

## 3. Improve Visualization & Presentation Quality

Reports should visually resemble modern analytics dashboards. The interface includes:
- Large primary KPI band (Spend, Leads, CPL, CTR) with period-over-period deltas
- Daily/weekly spend trend charts
- Per-platform breakdown cards (Google, Meta, TikTok) with actual brand logos
- Conversions by platform comparison chart (bar chart)
- Top campaign per platform table
- Executive all-locations summary view with spend share bars

The design follows a premium dark/light theme with a deep navy dark mode and a clean steel-blue healthcare aesthetic in light mode. Theme is persistent per user via localStorage with a toggle integrated into the sidebar.

---

# Core Features

## 1. Automated Data Aggregation

The system pulls data from:
- **Google Ads** — all 5 locations live
- **Meta Ads** — all 5 locations live
- **TikTok Ads** — San Antonio live; other locations to be added as accounts are onboarded
- GA4 (optional future)
- FlexBook (future attribution phase)

Data collection is handled using n8n workflows — one per location (San Antonio, Springfield, Las Vegas, Austin, New Mexico).

---

## 2. Centralized Database

**Technology:** Supabase (PostgreSQL) — schema v2 (`supabase-schema-v2.sql`)

**Purpose:** Store daily advertising data in a centralized structure for:
- Dashboard rendering (any date range)
- Trend comparisons (period-over-period, any window)
- Historical reporting
- AI summaries (future)
- Cross-location analysis

---

## 3. Dashboard-Based Reporting

Instead of PDFs or slide decks, reports are presented as live dashboard pages.

Each location dashboard includes:

### Executive KPI Band
- Total Spend with period-over-period delta
- Total Leads with delta
- Blended CPL with delta (lower is better)
- Blended CTR

### Trend Charts
- Daily spend trend (area chart, Google + Meta + TikTok)
- Conversions by platform (bar chart)
- Auto-switches to weekly rollup for ranges > 90 days

### Platform Breakdown
- One card per platform (Google Ads, Meta Ads, TikTok Ads)
- Shows: spend with delta, spend share bar, leads, CPL, clicks, CTR
- Uses actual platform brand logos (Google multicolor G, Meta f, TikTok note)

### Top Campaign per Platform Table
- Best campaign per platform (by conversions → CPL → spend)
- Campaign name with platform icon
- Spend, leads, CPL, CTR columns

---

## 4. Authentication & Access Control

Role-based access control with two roles:

- **admin** — accesses all 5 locations + executive dashboard
- **viewer** — accesses only assigned location dashboards

### Auth Flow (OTP — no passwords)
1. User visits `/login`, enters their email
2. Supabase sends a 6-digit one-time code via Brevo SMTP
3. User enters the code → signed in
4. If no role assigned → lands on `/pending` (awaiting access)
5. Admin runs SQL to assign role
6. User clicks "Check dashboard access" → enters their assigned dashboard

New users are created automatically on first OTP use — no separate signup page.

**Supabase settings required:**
- Authentication → Email → "Confirm email" must be **OFF** (otherwise first-time users receive a confirmation link instead of an OTP)
- SMTP configured via Brevo (use SMTP key `xsmtpsib-...`, not API key)

---

## 5. Location-Level Performance

Each of the 5 location dashboards shows:
- Location-specific spend, leads, CPL, CTR
- Platform-level breakdown
- Spend and lead trends
- Campaign performance

---

## 6. Executive Dashboard

`/dashboard/executive` consolidates all locations:
- Total company spend, leads, blended CPL
- All-locations table with spend share bars and drill-through links
- Same date range selector (9 presets + custom)

---

# Report Structure

## Location Dashboards

`/dashboard/[location]` — 5 locations:

| Location | slug | Data Status |
|---|---|---|
| Springfield | `springfield` | ✅ Google + Meta live (incl. Olathe/KC) |
| San Antonio | `san-antonio` | ✅ Google + Meta + TikTok live |
| Las Vegas | `las-vegas` | ✅ Google + Meta live |
| Austin | `austin` | ✅ Google + Meta live |
| New Mexico | `new-mexico` | ✅ Google + Meta live |

## Executive Dashboard

`/dashboard/executive` — admin only. Shows all 5 locations.

---

# Technical Stack

| Layer | Technology | Status |
|---|---|---|
| Automation | n8n | **5 locations live** (SA, Springfield, LV, Austin, NM) |
| Database | Supabase (PostgreSQL) | Live (v2 schema) |
| Frontend Dashboard | Next.js 15 + App Router | Complete |
| Auth | Supabase Auth + `@supabase/ssr` | Complete — OTP (email code), Brevo SMTP, no passwords, RBAC |
| Design System | Tailwind CSS + CSS custom properties | Complete — dark/light mode, navy palette |
| Charts | Recharts | Implemented |
| Hosting | Vercel | Deploying (celebrate-analytics.vercel.app) |
| AI Summaries | OpenAI API | Deprioritized |

---

# Development Status

## Phase 1 — Database ✅
- v2 schema deployed (`supabase-schema-v2.sql`) — `daily_metrics` + `daily_campaigns`
- Auth schema deployed (`supabase-schema-auth.sql`) — `user_roles` + `user_location_access`

## Phase 2 — n8n Ingestion ✅ (all 5 locations live)
- ✅ San Antonio — Google Ads + Meta Ads + TikTok Ads
- ✅ Springfield — Google Ads + Meta Ads (4 Meta accounts: West Republic, North Glenstone, North Lindbergh, Olathe)
- ✅ Las Vegas — Google Ads + Meta Ads
- ✅ Austin — Google Ads + Meta Ads
- ✅ New Mexico — Google Ads + Meta Ads
- Pending: TikTok for all locations except San Antonio

## Phase 3 — Dashboard ✅ Complete
- Next.js 15 app fully built with all components
- Daily data architecture, flexible date ranges, period-over-period comparison
- OTP auth: passwordless email code flow, RBAC (admin/viewer + location access)
- Design system: deep navy dark mode, healthcare-aesthetic light mode, theme toggle, platform logos
- Smooth hover animations on all cards and containers
- Loading skeletons on dashboard route transitions
- Deployed on Vercel (celebrate-analytics.vercel.app)

## Phase 4 — Attribution (Future)
- FlexBook appointment tracking
- Offline conversion imports
- Booked appointment attribution

## Phase 5 — Platform Expansion (Planned)
- SEO analytics (Google Search Console) per location
- Social media analytics (Meta Page Insights, TikTok organic) per location
- New roles: `super_admin`, `cmo`, `paid_ads`, `seo`, `social_media`
- Full details in `EXPANSION.md`

---

# Final Goal

A clean, automated, dashboard-based analytics platform that:
- Replaces Madgicx reporting
- Provides executive-ready visual dashboards for any date range
- Supports per-location and company-wide reporting
- Centralizes paid ads analytics in a fully owned stack
- Ingests data daily with zero manual work
- Improves customization and scalability
- Gives full ownership over marketing reporting infrastructure
- Eventually expands to cover SEO and organic social performance alongside paid ads

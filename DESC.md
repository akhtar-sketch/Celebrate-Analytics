# Paid Ads Analytics Dashboard — Celebrate Dental and Braces
## Project Overview

> **Implementation status as of 2026-05-24:** Dashboard, auth, and design system complete. TikTok Ads n8n ingestion workflow in progress. Google and Meta ingestion changes documented and ready to apply.

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
- Google Ads
- Meta Ads
- TikTok Ads (n8n workflow in progress — San Antonio live)
- GA4 (optional future)
- FlexBook (future attribution phase)

Data collection is handled using n8n workflows.

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

- **admin** — accesses all 8 locations + executive dashboard
- **viewer** — accesses only assigned location dashboards

### Auth Flow (OTP — no passwords)
1. User visits `/login`, enters their email
2. Supabase sends a 6-digit one-time code to that email
3. User enters the code → signed in
4. If no role assigned → lands on `/pending` (awaiting access)
5. Admin receives a Google Chat notification and runs SQL to assign role
6. User clicks "Check dashboard access" → enters their assigned dashboard

New users are created automatically on first OTP use — no separate signup page.

---

## 5. Location-Level Performance

Each of the 8 location dashboards shows:
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

`/dashboard/[location]` — 8 locations:

| Location | slug |
|---|---|
| Springfield | `springfield` |
| San Antonio | `san-antonio` |
| Las Vegas | `las-vegas` |
| Chicago | `chicago` |
| Austin Main | `austin-main` |
| New Mexico | `new-mexico` |
| Kansas City | `kansas-city` |
| Austin ED | `austin-ed` |

## Executive Dashboard

`/dashboard/executive` — admin only.

---

# Technical Stack

| Layer | Technology | Status |
|---|---|---|
| Automation | n8n | Google + Meta changes documented; TikTok workflow in progress |
| Database | Supabase (PostgreSQL) | Live (v2 schema — run `supabase-schema-v2.sql`) |
| Frontend Dashboard | Next.js 15 + App Router | Complete |
| Auth | Supabase Auth + `@supabase/ssr` | Complete — OTP (email code), no passwords, RBAC |
| Design System | Tailwind CSS + CSS custom properties | Complete — dark/light mode, navy palette |
| Charts | Recharts | Implemented |
| Hosting | Ubuntu VPS (testing) / Vercel (planned) | VPS ready |
| AI Summaries | OpenAI API | Deprioritized |

---

# Development Status

## Phase 1 — Database ✅
- v2 schema designed (`supabase-schema-v2.sql`) — `daily_metrics` + `daily_campaigns`
- Auth schema (`supabase-schema-auth.sql`) — `user_roles` + `user_location_access`

## Phase 2 — n8n Ingestion ⏳
- Daily ingestion changes fully documented in `README.md`
- TikTok Ads HTTP Request node + Code transform + Supabase upsert pattern built and verified
- **Pending:** apply changes to Google + Meta workflow, expand to all 8 locations, run 90-day backfill

## Phase 3 — Dashboard ✅ Complete
- Next.js 15 app fully built with all components
- Daily data architecture, flexible date ranges, period-over-period comparison
- OTP auth: passwordless email code flow, RBAC (admin/viewer + location access)
- Google Chat notification on new user verification via n8n webhook
- Design system: deep navy dark mode, healthcare-aesthetic light mode, theme toggle, platform logos
- Smooth hover animations on all cards and containers
- Loading skeletons on dashboard route transitions

## Phase 4 — Attribution (Future)
- FlexBook appointment tracking
- Offline conversion imports
- Booked appointment attribution

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

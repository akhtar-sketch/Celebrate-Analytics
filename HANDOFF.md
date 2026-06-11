# Celebrate Analytics — Project Handoff

**Company:** Celebrate Dental and Braces
**Project:** Daily paid ads analytics dashboard replacing Madgicx
**Last updated:** 2026-06-10
**Current status:** 5 of 5 locations fully integrated and live (San Antonio, Springfield, Las Vegas, Austin, New Mexico). Springfield includes Olathe/Kansas City rolled up. Dashboard deployed on Vercel (celebrate-analytics.vercel.app). OTP auth working. Platform expansion to SEO + Social Media designed and documented.

---

## READ THIS FIRST — What This Project Is

A fully internal analytics dashboard that:
- Pulls paid ads data daily from Google Ads, Meta Ads, and TikTok Ads via n8n
- Stores one row per location × platform × day in Supabase (PostgreSQL)
- Renders live dashboards per location + one executive view in Next.js 15
- Supports flexible date ranges: Last 7/14/30/90/365 days, This/Last month, This/Last quarter, custom
- Replaces Madgicx quarterly reporting with a fully owned platform

"Report" in this project means a **live analytics dashboard** with KPI cards, trend charts, platform breakdowns, and period-over-period comparisons — not a PDF or slide deck.

**The goal** is eventually one dashboard per location showing Google Ads + Meta Ads + TikTok Ads, plus optional SEO and social media channels. Currently live: San Antonio (Google + Meta + TikTok), Springfield (Google + Meta), Las Vegas (Google + Meta).

---

## Directory Structure

```
d:\AI\
├── Reporting System\                              ← THIS project root
│   ├── HANDOFF.md                                 ← this file (read on context reset)
│   ├── DESC.md                                    ← project requirements + feature overview
│   ├── README.md                                  ← n8n workflow guide + account IDs + setup checklist
│   ├── EXPANSION.md                               ← platform expansion plan (SEO + Social Media) — planned only
│   ├── ISSUE.md                                   ← resolved ChunkLoadError deployment issue (reference)
│   ├── supabase-schema.sql                        ← v1 schema (archived — do not use)
│   ├── supabase-schema-v2.sql                     ← v2 data schema (deployed)
│   ├── supabase-schema-auth.sql                   ← auth schema (deployed)
│   ├── Celebrate Analytics - Testing.json         ← n8n workflow (covers SA + Springfield + LV)
│   └── celebrate-analytics\                       ← Next.js 15 dashboard app
│       ├── package.json
│       ├── next.config.ts                         ← devIndicators disabled
│       ├── tailwind.config.ts                     ← custom design tokens
│       ├── .env.local.example                     ← copy → .env.local, fill in 3 Supabase keys
│       └── src\
│           ├── types.ts                           ← all shared TypeScript types
│           ├── middleware.ts                      ← route protection, session refresh
│           ├── config\
│           │   └── locations.ts                  ← 6 locations + Google/Meta/TikTok ID mapping
│           ├── lib\
│           │   ├── supabase.ts                   ← service role client (server-side data queries)
│           │   ├── supabase-server.ts            ← cookie-aware server client (session validation)
│           │   ├── supabase-browser.ts           ← browser client (OTP sign-in, sign-out)
│           │   ├── auth.ts                       ← getSessionUser, getUserAccess, RBAC helpers
│           │   ├── queries.ts                    ← getLocationMetrics, getSpendTrend, getTopCampaigns, getExecutiveSummary
│           │   ├── dateUtils.ts                  ← PRESETS, getPreviousPeriod, formatDateRange, toMondayISO
│           │   └── formatters.ts                 ← fmtCurrency, fmtNumber, fmtPercent, fmtDelta
│           ├── components\
│           │   ├── ThemeProvider.tsx             ← dark/light context, localStorage, FOUC prevention
│           │   ├── PlatformIcon.tsx              ← Google/Meta/TikTok SVG logos + PLATFORM_CHART_COLORS
│           │   ├── Sidebar.tsx                   ← fixed left nav with logo (clickable for admins) + theme toggle
│           │   ├── UserMenu.tsx                  ← user email, role badge, sign-out
│           │   ├── KPICard.tsx                   ← metric with delta + prior period label
│           │   ├── DateRangePicker.tsx           ← 9 presets + custom range (client, URL params)
│           │   ├── SpendTrendChart.tsx           ← area chart, Google + Meta + TikTok (Recharts)
│           │   ├── PlatformCards.tsx             ← per-platform card with logo + full metrics
│           │   ├── PlatformComparisonChart.tsx   ← grouped bar chart, conversions by platform over time
│           │   └── TopCampaignsTable.tsx         ← top campaign per platform with platform icon badges
│           └── app\
│               ├── globals.css                   ← CSS custom property design tokens + ::selection color
│               ├── icon.png                      ← favicon (orange star)
│               ├── layout.tsx                    ← root layout: ThemeProvider, Inter font, FOUC script
│               ├── page.tsx                      ← redirects to /dashboard/executive
│               ├── login\page.tsx                ← two-step OTP flow (email → 6-digit code)
│               ├── pending\
│               │   ├── page.tsx                  ← pending approval screen
│               │   └── sign-out.tsx              ← client sign-out button
│               └── dashboard\
│                   ├── layout.tsx                ← auth + role check, Sidebar wrapper
│                   ├── executive\
│                   │   ├── page.tsx              ← all-locations aggregate (admin only)
│                   │   └── loading.tsx           ← skeleton loading UI
│                   └── [location]\
│                       ├── page.tsx              ← per-location KPI + charts
│                       └── loading.tsx           ← skeleton loading UI
│
└── n8n\Work\CD - Pulse\
    ├── CD Pulse v1.5 (Production).json          ← original weekly HTML reports — keep, do not touch
    └── README.md                                ← n8n setup guide (separate from this project)
```

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Data ingestion | n8n | 3 locations live; 3 pending expansion; timezone: America/Chicago |
| Database | Supabase (PostgreSQL) | Live — v2 schema deployed |
| Frontend dashboard | Next.js 15 (App Router) | Complete |
| Authentication | Supabase Auth + `@supabase/ssr` | Complete — OTP (no passwords), RBAC |
| Design system | Tailwind CSS + CSS custom properties | Complete — dark navy + light steel-blue, theme toggle |
| Charts | Recharts | Implemented (AreaChart + BarChart) |
| Hosting | Vercel | Live (celebrate-analytics.vercel.app); root dir: `celebrate-analytics` |
| AI summaries | OpenAI API | Deprioritized — not in MVP |

---

## What Has Been Achieved (as of 2026-06-10)

### Completed
- [x] Supabase v2 schema deployed (`daily_metrics` + `daily_campaigns` tables)
- [x] Auth schema deployed (`user_roles` + `user_location_access` tables)
- [x] Next.js 15 dashboard fully built — all components, charts, KPI cards, executive view
- [x] OTP authentication — passwordless email code flow, no signup page, RBAC (admin/viewer)
- [x] Brevo SMTP configured in Supabase for OTP emails (SMTP key, not API key)
- [x] Dashboard deployed on Vercel (celebrate-analytics.vercel.app); root directory set to `celebrate-analytics`
- [x] Celebrate Analytics logo (celebrate_analytics_logo_new.png) throughout dashboard
- [x] Admin logo click → `/dashboard/executive`; hover animation on all cards
- [x] Design system — deep navy dark mode, healthcare light mode, CSS custom properties
- [x] Loading skeletons on route transitions
- [x] n8n daily ingestion workflow — **3 locations fully integrated and live:**
  - San Antonio: Google Ads + Meta Ads + TikTok Ads
  - Springfield: Google Ads + Meta Ads (3 Meta accounts aggregated)
  - Las Vegas: Google Ads + Meta Ads
- [x] Credentials security — access tokens in n8n Header Auth credentials, IDs in n8n `.env`
- [x] Platform expansion plan documented in `EXPANSION.md`

### Pending / Not Yet Done
- [ ] Add TikTok branches to remaining locations (Las Vegas, Austin, New Mexico, Springfield) as TikTok accounts are onboarded
- [ ] Google Chat new-user notification (dropped due to pg_net issue — see below)
- [ ] Custom domain (`analytics.celebratedental.com`) → add in Vercel Project Settings → Domains
- [ ] Phase 5 expansion: SEO dashboard + Social Media dashboard (see `EXPANSION.md`)
- [ ] FlexBook attribution (future phase)

---

## Important Issues & Their Resolutions

### 1. ChunkLoadError on VPS Deployment (RESOLVED)
**Symptom:** Login page rendered correctly but clicking "Send code" crashed with `ChunkLoadError: Loading chunk failed (400)`.
**Root cause:** VPS had outdated `login/page.tsx` source — old code compiled to chunk hash `d21ad9eeacb8e936`, new OTP code compiles to a different hash. The webpack runtime embedded the old hash; the old file no longer existed after a clean rebuild.
**Fix:** `git pull` on VPS → `rm -rf .next` → `npm run build` → `pm2 restart`.
**Key lesson:** `NEXT_PUBLIC_` env vars are baked at build time. Always ensure `.env.local` exists on VPS **before** `npm run build`. Always `git pull` before rebuilding.
See `ISSUE.md` for full diagnostic details.

### 2. Supabase "database error updating user" on OTP Verify (RESOLVED)
**Symptom:** Entering the OTP code returned "database error updating user" error.
**Root cause:** A custom trigger `on_user_email_verified` on `auth.users` was failing — it tried to use `pg_net` to call an n8n webhook (Google Chat notification), but `pg_net` was not installed or the webhook URL was unreachable.
**Fix:** Dropped the trigger:
```sql
DROP TRIGGER IF EXISTS on_user_email_verified ON auth.users;
```
**Status:** Google Chat notification is not currently active. Re-implement once `pg_net` is confirmed available.

### 3. Supabase Sends Confirmation Link Instead of OTP (RESOLVED)
**Symptom:** First-time OTP login sent a "Confirm your email" link instead of a 6-digit code.
**Root cause:** Supabase Authentication → Providers → Email → "Confirm email" was ON. For new users, this sends a confirmation link first.
**Fix:** Supabase dashboard → Authentication → Providers → Email → disable **"Confirm email"**.

### 4. Brevo SMTP — Using Wrong Key Type (RESOLVED)
**Symptom:** OTP took 20-30 seconds then failed with `{}` error.
**Fix:** Use the **SMTP key** (`xsmtpsib-...`) from Brevo, not the API key. Username = your Brevo account email.

### 5. TikTok n8n Expression Arithmetic Bug (RESOLVED)
**Symptom:** TikTok API returned no data; date range was wrong.
**Root cause:** `start_date` field in n8n had value `=2026-04-01`. The `=` prefix causes n8n to evaluate it as JavaScript arithmetic: `2026 - 4 - 1 = 2021`.
**Fix:** Use expression syntax `{{ $('Get Req. Dates').item.json.date_from }}` — never prefix a date value with `=`.

---

## Auth System

### How OTP Login Works

```
/login  →  enter email  →  supabase.auth.signInWithOtp()  →  6-digit code sent via Brevo SMTP
                                                                      ↓
                                                          User enters 6-digit code
                                                                      ↓
                                                     supabase.auth.verifyOtp()
                                                    ├── has role  →  /dashboard/executive
                                                    └── no role   →  /pending
                                                                          ↓
                                              [Admin runs INSERT INTO user_roles ... in Supabase SQL Editor]
                                                                          ↓
                                              "Check dashboard access"  →  /dashboard/executive
```

New users are auto-created by Supabase on first OTP use (`shouldCreateUser: true`).

**Required Supabase settings:**
- Authentication → Providers → Email → "Confirm email" = **OFF**
- SMTP → Brevo SMTP key (not API key), Brevo account email as username

### Role Model

| Role | Executive dashboard | Location dashboards | Logo click |
|---|---|---|---|
| `admin` | ✅ Full access | ✅ All 6 locations | → /dashboard/executive |
| `viewer` | ❌ Redirected to first assigned location | ✅ Only assigned location_ids | No action |

### Granting Access (Admin SQL)

```sql
-- Find user UUID after they sign in for the first time
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Grant admin role (all locations)
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');

-- Grant viewer role with specific locations
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'viewer');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'san-antonio');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'las-vegas');
```

### Key Auth Files
- `src/lib/auth.ts` — `getUserAccess()` — reads `user_roles` + `user_location_access` via service role key
- `src/lib/supabase-browser.ts` — browser client for `signInWithOtp` + `verifyOtp` + `signOut`
- `src/lib/supabase-server.ts` — cookie-aware server client for session validation in middleware
- `src/lib/supabase.ts` — service role client for all data queries (never reaches the browser)
- `src/middleware.ts` — protects `/dashboard/*` routes, redirects unauthenticated users to `/login`
- `src/app/login/page.tsx` — two-step OTP form (email → 6-digit code)
- `src/app/pending/page.tsx` — waiting-for-role screen shown to users with no role assigned

---

## Database Schema

### Tables (deployed in Supabase)

**`daily_metrics`** — one row per location × platform × day
```
location_id, location_name, platform, date, spend, impressions, clicks, conversions, cpl, ctr
UNIQUE(location_id, platform, date)
```

**`daily_campaigns`** — one row per location × platform × campaign × day
```
location_id, location_name, platform, date, campaign_id, campaign_name, spend, impressions, clicks, conversions, cpl, ctr
UNIQUE(location_id, platform, date, campaign_id)
```

**`user_roles`** — one row per user
```
user_id (FK → auth.users), role ('admin' | 'viewer')
UNIQUE(user_id)
```

**`user_location_access`** — one row per viewer × location (admin ignores this)
```
user_id (FK → auth.users), location_id (text slug)
UNIQUE(user_id, location_id)
```

All tables have RLS enabled. `user_roles` and `user_location_access` allow no direct client access (service role only). Data tables can be queried via the service role key from server components.

---

## n8n Workflow: Integrated Locations

| Location | Google | Meta | TikTok | Notes |
|---|---|---|---|---|
| San Antonio | ✅ `2429608734` | ✅ `1015442443965530` | ✅ `1759853290066977` | All platforms live |
| Springfield | ✅ `3158644952` | ✅ West Republic + N. Glenstone + N. Lindbergh + Olathe | Pending | Kansas City/Olathe rolled into Springfield |
| Las Vegas | ✅ `2391448311` | ✅ `2267056450490613` | Pending | |
| Austin | ✅ `6276915301` | ✅ `1079447286488041` | Pending | |
| New Mexico | ✅ `2769191567` | ✅ `515584627540511` | Pending | |

Springfield Meta accounts:
- West Republic: `885038680320071` (slug: `west-republic`)
- North Glenstone: `2203388956855958` (slug: `north-glenstone`)
- Lindbergh: `2203220086749865` (slug: `lindbergh`)

The dashboard aggregates all Springfield slugs into one view via `getAllLocationIds('springfield')` in `src/config/locations.ts`.

### n8n Workflow Settings
- **Timezone:** `America/Chicago` (Central Time — covers SA, Springfield, Kansas City; handles CST/CDT automatically)
- **Schedule:** daily at 6:00 AM Central (`0 6 * * *`)

### n8n Credential Security Rules
- Access tokens → **n8n Credentials** (Header Auth, encrypted) — never in Set nodes
- Advertiser IDs, location slugs → **n8n `.env`** (`$env.VAR_NAME`) — never hardcoded in nodes
- Google Ads OAuth → n8n Credentials (Google Ads OAuth2)
- Developer token: stored in n8n Google Ads OAuth2 credential (do not commit to git)

---

## Dashboard: How Date Filtering Works

URL params: `?from=YYYY-MM-DD&to=YYYY-MM-DD`

- Default range: Last 30 days (yesterday as `to`, 30 days back as `from`)
- `DateRangePicker` — 9 presets + custom range, pushes new URL params → server re-renders
- Previous period: same number of days immediately preceding the selected range
- Chart granularity: daily if range ≤ 90 days, weekly rollup (Monday-anchored) if > 90 days
- KPI delta: `(current - prev) / |prev| × 100%`, with green/red color + prior period label
- x-axis fills all calendar days with 0 for missing platform data

---

## Design System

**Theme architecture:**
- `tailwind.config.ts` — semantic token color names
- `globals.css` — CSS custom properties in `:root` (light) + `.dark` (dark); `::selection` = translucent orange-yellow
- `ThemeProvider.tsx` — manages `class="dark"` on `<html>`, persisted to `localStorage`
- Root `layout.tsx` — inline `<script>` in `<head>` applies theme before first paint (prevents FOUC)

**Design tokens (key values):**

| Token | Dark | Light |
|---|---|---|
| `bg-canvas` | `#070f1d` deep navy | `#eef4fc` steel blue |
| `bg-surface` | `#0b1426` navy card | `#ffffff` white |
| `border-edge` | `#1a2c4e` | `#c4d6ec` |
| `text-ink` | `#dce6f8` | `#0b162a` |
| `text-ink-2` | `#708cb6` | `#415a7a` |
| `text-ink-3` | `#3a5072` | `#8aa2c0` |

**Platform chart colors:** Google = blue-500, Meta = amber-500, TikTok = pink-500 (visually distinct, not brand colors)

---

## Vercel Deployment

The app is deployed on Vercel at `celebrate-analytics.vercel.app`.

**Vercel project settings:**
- **Root Directory:** `celebrate-analytics` (the Next.js app is a subdirectory of the repo)
- **Framework Preset:** Next.js
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)

**Environment variables set in Vercel → Project Settings → Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Deployments are automatic** — every push to `main` triggers a redeploy. No manual build steps needed.

**Supabase URL config (required for OTP redirect):**
- Authentication → URL Configuration → Site URL: `https://celebrate-analytics.vercel.app`
- Redirect URLs: `https://celebrate-analytics.vercel.app/**`
- When a custom domain is added, update both of these to the new domain

**Custom domain:**
- Add `analytics.celebratedental.com` in Vercel → Project Settings → Domains
- Point a CNAME record at Vercel's DNS target (shown in Vercel after adding the domain)
- After adding, update Site URL + Redirect URLs in Supabase

---

## Platform Expansion Plan (Designed, Not Yet Implemented)

Full details in `EXPANSION.md`. Summary:

**New channels to add:**
- SEO — Google Search Console per location (clicks, impressions, CTR, avg position)
- Social Media — Meta Page Insights + TikTok organic per location (reach, engagements, followers)

**New role model:**
| Role | Paid Ads | SEO | Social | Notes |
|---|---|---|---|---|
| `super_admin` | ✅ | ✅ | ✅ | Developer/admin — all channels, all locations |
| `cmo` | ✅ | ✅ | ✅ | Sees everything |
| `paid_ads` | ✅ | ❌ | ❌ | Replaces current `admin`/`viewer` |
| `seo` | ❌ | ✅ | ❌ | All locations, SEO only |
| `social_media` | ❌ | ❌ | ✅ | All locations, social only |

**New routes:**
- `/dashboard/paid-ads/executive` and `/dashboard/paid-ads/[location]` (moved from `/dashboard/[location]`)
- `/dashboard/seo/[location]`
- `/dashboard/social/[location]`

**New tables:** `daily_seo_metrics`, `daily_social_metrics` (schemas in `EXPANSION.md`)

**Implementation phases:** Phase 1 (auth restructure) → Phase 2 (SEO) → Phase 3 (Social) → Phase 4 (Cross-channel exec view). **Nothing has been implemented yet** — `EXPANSION.md` is a planning document only.

---

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| OTP instead of email+password | Simpler UX, no password management, single flow for new + returning users |
| Daily ingestion instead of weekly snapshots | Enables flexible date ranges without re-engineering the data layer |
| All aggregation at query time | Dashboard computes any time range dynamically; no pre-aggregation needed |
| Previous period = same-length window immediately preceding | Works for any date range preset, not just fixed quarter-over-quarter |
| Weekly chart rollup for ranges > 90 days | Prevents 365-point x-axis from being illegible |
| x-axis fills all calendar days with 0 | Platforms have different active days; fill ensures aligned multi-platform chart |
| URL params for date range state | Deep-linking, bookmarking; server components re-fetch on param change |
| Service role key server-side only | All data queries in Server Components — key never reaches the browser |
| Two Supabase clients | `supabase-server.ts` (anon + cookies) for session; `supabase.ts` (service role) for data |
| `conversions` as `numeric(10,4)` | Google Ads returns fractional conversions (e.g. 123.18) |
| n8n credentials in Header Auth (not Set nodes) | Tokens encrypted at rest; never appear in workflow exports or execution logs |
| location_id as text slug | Human-readable, consistent across all platforms, easy to type in SQL |

---

## Running Locally

```powershell
cd "d:\AI\Reporting System\celebrate-analytics"
# First time: copy .env.local.example → .env.local and fill in 3 Supabase keys
npm install
npm run dev   # → http://localhost:3000
```

`.env.local` requires:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

---

## Immediate Next Steps (Priority Order)

1. **Add TikTok for additional locations** — as each location's TikTok Ads account is onboarded, add a TikTok branch following the San Antonio pattern (Las Vegas, Springfield, Austin, New Mexico).
2. **Re-implement Google Chat new-user notification** — confirm `pg_net` extension is available in Supabase (`CREATE EXTENSION IF NOT EXISTS pg_net`), set up n8n webhook, re-add the trigger.
3. **Add custom domain** — `analytics.celebratedental.com` → Vercel Project Settings → Domains → CNAME to Vercel; update Supabase Site URL + Redirect URLs.
4. **Begin Phase 1 of expansion plan** (when ready) — update role model, restructure routes, update middleware.

---

## Do Not Touch

`d:\AI\n8n\Work\CD - Pulse\CD Pulse v1.5 (Production).json` — this is a separate, unrelated n8n workflow that sends weekly HTML email reports. It is in production and must not be modified.

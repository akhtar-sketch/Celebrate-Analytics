# Celebrate Analytics — Project Handoff

**Company:** Celebrate Dental and Braces
**Project:** Daily paid ads analytics dashboard replacing Madgicx
**Last updated:** 2026-05-24
**Current phase:** Dashboard + Auth + Design System complete — TikTok n8n workflow in progress, Google + Meta changes documented and ready to apply

---

## What This Project Is

A fully internal analytics dashboard that:
- Pulls paid ads data daily from Google Ads, Meta Ads, and TikTok Ads
- Stores one row per location × platform × day in Supabase (PostgreSQL)
- Renders live dashboards per location + one executive view
- Supports flexible date ranges: Last 7/14/30/90/365 days, This/Last month, This/Last quarter, custom
- Replaces Madgicx quarterly reporting with a fully owned Next.js platform

"Report" in this project means a **live analytics dashboard** with KPI cards, trend charts, platform breakdowns, and period-over-period comparisons — not a PDF or slide deck.

---

## Directory Structure

```
d:\AI\
├── Reporting System\                              ← THIS project root
│   ├── HANDOFF.md                                 ← this file
│   ├── DESC.md                                    ← project requirements + feature overview
│   ├── README.md                                  ← n8n workflow guide + setup checklist
│   ├── supabase-schema.sql                        ← v1 schema (archived — do not use)
│   ├── supabase-schema-v2.sql                     ← v2 data schema (run this)
│   ├── supabase-schema-auth.sql                   ← auth schema (run this too)
│   ├── Celebrate Analytics - Testing.json         ← n8n workflow (needs daily ingestion updates)
│   └── celebrate-analytics\                       ← Next.js 15 dashboard app
│       ├── package.json
│       ├── next.config.ts                         ← devIndicators disabled
│       ├── tailwind.config.ts                     ← custom design tokens (canvas, surface, ink, edge, etc.)
│       ├── .env.local.example                     ← copy → .env.local, fill in 3 Supabase keys
│       └── src\
│           ├── types.ts                           ← all shared TypeScript types
│           ├── middleware.ts                      ← route protection, session refresh
│           ├── config\
│           │   └── locations.ts                  ← 8 locations + Google/Meta/TikTok ID mapping
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
│           │   ├── TopCampaignsTable.tsx         ← top campaign per platform with platform icon badges
│           │   └── PlatformBreakdown.tsx         ← legacy table component (unused)
│           └── app\
│               ├── globals.css                   ← CSS custom property design tokens + ::selection color
│               ├── icon.png                      ← favicon (orange star — auto-served by Next.js App Router)
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
| Data ingestion | n8n | TikTok pattern built; Google + Meta changes documented — apply to workflow |
| Database | Supabase (PostgreSQL) | Live — run `supabase-schema-v2.sql` + `supabase-schema-auth.sql` to migrate |
| Frontend dashboard | Next.js 15 (App Router) | Complete |
| Authentication | Supabase Auth + `@supabase/ssr` | Complete — OTP (no passwords), RBAC, Google Chat new-user notification |
| Design system | Tailwind CSS + CSS custom properties | Complete — dark navy + light steel-blue, theme toggle, hover animations |
| Charts | Recharts | Implemented (AreaChart + BarChart, daily/weekly, theme-aware) |
| Hosting | Ubuntu VPS (testing) / Vercel (planned) | VPS ready; Vercel when ready to deploy |
| AI summaries | OpenAI API | Deprioritized — not in MVP |

---

## Phase Progress

### Phase 1 — Database & Data Storage
- [x] v2 schema designed (`supabase-schema-v2.sql`) — `daily_metrics` + `daily_campaigns`
- [x] Auth schema designed (`supabase-schema-auth.sql`) — `user_roles` + `user_location_access`
- [ ] **Pending: run both SQL files in Supabase SQL Editor**

### Phase 2 — n8n Ingestion Workflow
- [x] TikTok Ads HTTP Request node setup verified (San Antonio)
- [x] TikTok Code transform node (daily_metrics + daily_campaigns split) built and tested
- [x] Daily ingestion pattern for Google + Meta documented in `README.md`
- [x] n8n credential security: access tokens in Header Auth credentials, config in `.env`
- [ ] **Pending: apply daily ingestion changes to Google + Meta workflow**
- [ ] Expand to all 8 Google + 7 Meta + TikTok locations
- [ ] Set daily Schedule Trigger (`0 6 * * *`)
- [ ] Run 90-day backfill manually after workflow is ready

### Phase 3 — Dashboard ✅ Complete
- [x] All components built and styled
- [x] Daily data architecture — all queries aggregate dynamically from `daily_metrics` + `daily_campaigns`
- [x] Flexible date filtering — 9 presets + custom range via `?from=&to=` URL params
- [x] Period-over-period comparison for any date window
- [x] Chart auto-scales: daily (≤ 90 days) or weekly rollup (> 90 days)
- [x] x-axis fills all calendar dates with 0 for missing data
- [x] OTP auth — passwordless email code, RBAC (admin/viewer + location access)
- [x] Google Chat notification on new user verification (n8n webhook + Supabase trigger)
- [x] Design system — CSS custom properties, dark/light theme, ThemeProvider, platform logos
- [x] Smooth hover animations on all cards and section containers
- [x] Loading skeletons on dashboard route transitions
- [x] Custom text selection color (translucent orange-yellow)
- [x] Conversions by Platform chart (replaced Spend by Platform)
- [x] Top Campaign per Platform (best per platform by conversions → CPL → spend)
- [x] Celebrate Analytics logo throughout (sidebar, login, pending) — admin logo is clickable
- [x] Custom favicon (orange star)

### Phase 4 — Attribution (future)
- [ ] FlexBook appointment tracking
- [ ] Offline conversion imports
- [ ] Booked appointment attribution

---

## Auth System

### How It Works (OTP — no passwords)

```
/login  →  enter email  →  supabase.auth.signInWithOtp()  →  6-digit code sent
                                                                      ↓
                                                          User enters code
                                                                      ↓
                                                     supabase.auth.verifyOtp()
                                                    ├── has role  →  /dashboard/executive
                                                    └── no role   →  /pending
                                                                          ↓
                                              [Google Chat notification sent to admin]
                                                                          ↓
                                              [Admin runs INSERT INTO user_roles ...]
                                                                          ↓
                                              "Check dashboard access"  →  /dashboard/executive
```

New users are auto-created by Supabase on first OTP use (`shouldCreateUser: true`).
The Supabase `email_confirmed_at` trigger fires on first verification — this powers the Google Chat alert.

### Role Model

| Role | Executive dashboard | Location dashboards | Logo click |
|---|---|---|---|
| `admin` | ✅ Full access | ✅ All 8 locations | → /dashboard/executive |
| `viewer` | ❌ Redirected to first assigned location | ✅ Only assigned location_ids | No action |

### Auth Tables

```sql
-- user_roles: one row per user
-- role values: 'admin' | 'viewer'
SELECT * FROM user_roles;

-- user_location_access: one row per viewer × location
SELECT * FROM user_location_access;
```

### Granting Access (Admin SQL)

```sql
-- Find a user's UUID after they sign in for the first time
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Grant admin role
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');

-- Grant viewer role with specific locations
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'viewer');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'springfield');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'las-vegas');
```

### Supabase Email Template

A custom branded OTP email template is configured in **Supabase → Authentication → Email Templates → Magic Link**.
Shows the Celebrate Analytics logo + 6-digit code in a styled card.
Logo URL must be a publicly hosted URL (Supabase Storage or production domain).

---

## Design System

### Theme Architecture

- `tailwind.config.ts` — extends Tailwind with semantic token color names
- `globals.css` — defines CSS custom properties in `:root` (light) and `.dark` (dark); includes `::selection` color (translucent orange-yellow)
- `ThemeProvider.tsx` — client component managing `class="dark"` on `<html>`, persisted to `localStorage`
- Root `layout.tsx` — inline `<script>` in `<head>` applies theme before first paint (prevents FOUC)

### Design Tokens

| Token | Dark value | Light value |
|---|---|---|
| `bg-canvas` | `#070f1d` deep navy | `#eef4fc` steel blue |
| `bg-surface` | `#0b1426` navy card | `#ffffff` white |
| `bg-raised` | `#101b32` elevated | `#f5faff` tinted |
| `bg-wash` | `#131f39` hover | `#e6f0fc` hover |
| `border-edge` | `#1a2c4e` | `#c4d6ec` |
| `border-edge-soft` | `#12203a` | `#d8e6f6` |
| `text-ink` | `#dce6f8` | `#0b162a` |
| `text-ink-2` | `#708cb6` | `#415a7a` |
| `text-ink-3` | `#3a5072` | `#8aa2c0` |

### Platform Colors

| Platform | Logo | Chart color |
|---|---|---|
| Google Ads | 4-color G (multicolor SVG) | `#3b82f6` blue-500 |
| Meta Ads | Facebook f (Meta blue `#1877F2`) | `#f59e0b` amber-500 |
| TikTok Ads | TikTok note (currentColor) | `#ec4899` pink-500 |

Chart colors are visually distinct by design (not strict brand colors) to be distinguishable side-by-side.

### Hover Animations

All cards and section containers use:
```
transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg
dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]
```
Platform cards use a stronger lift:
```
hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
```

---

## Dashboard: How Date Filtering Works

URL params: `?from=YYYY-MM-DD&to=YYYY-MM-DD`

- Default range: Last 30 days (yesterday as `to`, 30 days back as `from`)
- `DateRangePicker` — 9 presets + custom range, pushes new URL params → server re-renders
- Previous period: same number of days immediately preceding the selected range
- Chart granularity: daily if range ≤ 90 days, weekly rollup (Monday-anchored) if > 90 days
- KPI delta: `(current - prev) / |prev| × 100%`, with green/red color + prior period date shown

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| OTP instead of email+password | Simpler UX, no password management, no signup page — one flow handles both new and returning users |
| Daily ingestion instead of weekly snapshots | Enables flexible date ranges without re-engineering the data layer |
| All aggregation at query time | Dashboard computes any time range dynamically; no pre-aggregation needed |
| Previous period = same-length window immediately preceding | More flexible than fixed QoQ; works for any date range preset |
| Weekly chart rollup for ranges > 90 days | Prevents 365-point x-axis from being illegible; auto-switches at 90-day threshold |
| x-axis fills all calendar days with 0 | Google and Meta have different active days; without fill, platforms share misaligned x-axes |
| URL params for date range state | Allows deep-linking and bookmarking; server components re-fetch on param change |
| Service role key server-side only | All data queries run in Server Components — key never reaches the browser |
| Google Chat alert via n8n + Supabase trigger | Decoupled from app code; fires on `email_confirmed_at` transition regardless of auth method |
| n8n credentials in Header Auth (not Set nodes) | Access tokens encrypted at rest, never appear in workflow exports or execution logs |
| TikTok 30-day API limit → daily ingestion | Fetch yesterday only in production; chunk by month for backfills |
| Two Supabase clients | `supabase-server.ts` (anon key + cookies) for session validation; `supabase.ts` (service role) for data queries |
| CSS custom properties for design tokens | Single source of truth for both themes; Tailwind references vars via `rgb(var(--token))` syntax |
| `conversions` as `numeric(10,4)` | Google Ads API returns fractional conversion values (e.g. 123.18) — integer would lose precision |
| location_id as text slug | Human-readable, consistent across all platforms, easy to type in SQL |

---

## Account & Location Mapping

### Google Ads Accounts (8 locations)
| Location | Customer ID | location_id slug |
|---|---|---|
| Springfield | `3158644952` | `springfield` |
| San Antonio | `2429608734` | `san-antonio` |
| Las Vegas | `2391448311` | `las-vegas` |
| Chicago | `6276915301` | `chicago` |
| Austin Main | `2769191567` | `austin-main` |
| New Mexico | `8844673094` | `new-mexico` |
| Kansas City | `7480415252` | `kansas-city` |
| Austin ED | `5412850943` | `austin-ed` |

### Meta Ads Accounts (7 locations)
| Location | Variable | Account ID | location_id slug |
|---|---|---|---|
| West Republic (Springfield) | `west_republic` | `885038680320071` | `west-republic` |
| North Glenstone (Springfield) | `n_glenstone` | `2203388956855958` | `north-glenstone` |
| Lindbergh (Springfield) | `n_lindbergh` | `2203220086749865` | `lindbergh` |
| Las Vegas | `las_vegas` | `2267056450490613` | `las-vegas` |
| Olathe (Kansas City) | `olathe` | `4175774955998110` | `olathe` |
| San Antonio | `san_antonio` | `1015442443965530` | `san-antonio` |
| New Mexico | `new_mexico` | `515584627540511` | `new-mexico` |

> Springfield has 3 Meta accounts. `getAllLocationIds(location)` returns `['springfield', 'west-republic', 'north-glenstone', 'lindbergh']`. Dashboard queries use `.in('location_id', ids)` to aggregate all four into one Springfield view.

### TikTok Ads Accounts
| Location | Advertiser ID | location_id slug |
|---|---|---|
| San Antonio | `1759853290066977` (campaign: "Lead 1") | `san-antonio` |

> TikTok API limit: max 30-day window per request when using `stat_time_day` dimension. Production workflow fetches yesterday only. Backfills chunk into 30-day windows.

---

## Immediate Next Steps (in order)

1. **Run `supabase-schema-v2.sql`** in Supabase SQL Editor → creates `daily_metrics` + `daily_campaigns`, drops v1 tables

2. **Run `supabase-schema-auth.sql`** in Supabase SQL Editor → creates `user_roles` + `user_location_access`

3. **Create `.env.local`** in `celebrate-analytics\` (copy `.env.local.example`, fill in all 3 keys):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   ```

4. **Configure Supabase OTP email template** → Authentication → Email Templates → paste branded HTML template (see DESC.md), set subject to "Your Celebrate Analytics sign-in code"

5. **Start dashboard** → `npm install && npm run dev` → visit http://localhost:3000

6. **Create first admin account**:
   - Go to `/login`, enter your email, enter the OTP code
   - You'll land on `/pending` — expected for first-time users
   - In Supabase SQL Editor: `SELECT id, email FROM auth.users;` to find your UUID
   - `INSERT INTO user_roles (user_id, role) VALUES ('<your-uuid>', 'admin');`
   - Click "Check dashboard access" — you're in

7. **Apply n8n daily ingestion changes** → see `README.md` for full change list

8. **Run 90-day backfill** → set date range in workflow, run manually once

9. **Expand n8n to all locations** → duplicate Google branch ×7, Meta branch ×6, TikTok per location

10. **Deploy** → `analytics.celebratedental.com` → Nginx + Let's Encrypt on VPS, or Vercel

---

## Running Locally

```powershell
cd "d:\AI\Reporting System\celebrate-analytics"
# First time: copy .env.local.example → .env.local and fill in Supabase keys
npm install
npm run dev   # → http://localhost:3000
```

## VPS Deployment

```bash
# Transfer (from Windows Git Bash / WSL):
rsync -avz --exclude=node_modules --exclude=.next \
  "/path/to/celebrate-analytics/" user@VPS_IP:/var/www/celebrate-analytics/

# On VPS:
cd /var/www/celebrate-analytics
cp .env.local.example .env.local && nano .env.local
npm install && npm run build
pm2 start npm --name "celebrate-analytics" -- start
pm2 save && pm2 startup
```

Nginx proxies port 80/443 → localhost:3000. Add `server_name analytics.celebratedental.com` + Certbot for SSL.

---

## Original Weekly Workflow (do not remove)

`CD Pulse v1.5 (Production).json` runs every Monday and generates HTML email reports. It is separate from this project and must remain untouched.

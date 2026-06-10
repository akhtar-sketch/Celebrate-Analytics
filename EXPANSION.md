# Celebrate Analytics — Platform Expansion Plan

**Status:** Planned — not yet implemented
**Scope:** Expand beyond paid ads into SEO and social media analytics, with a granular role-based access system
**Last updated:** 2026-06-10

---

## Overview

The current system covers paid advertising analytics (Google Ads, Meta Ads, TikTok Ads) with a simple admin/viewer role model. This expansion adds two new analytics channels — SEO and Social Media — and introduces a more granular permission system so each team member sees only their relevant dashboards.

---

## New Role Model

### Roles

| Role | Paid Ads | SEO | Social Media | Location Scope |
|---|---|---|---|---|
| `super_admin` | ✅ | ✅ | ✅ | All locations |
| `cmo` | ✅ | ✅ | ✅ | All locations |
| `paid_ads` | ✅ | ❌ | ❌ | All OR assigned locations |
| `seo` | ❌ | ✅ | ❌ | All locations |
| `social_media` | ❌ | ❌ | ✅ | All locations |

### Notes
- `super_admin` is for the developer/admin — sees everything across all channels and locations for debugging and testing
- `cmo` sees everything — all channels, all locations, executive view
- `paid_ads` replaces the old `admin` (all locations) and `viewer` (assigned locations) — the `user_location_access` table still applies to this role only
- `seo` and `social_media` always see all 6 locations within their channel — no location restriction needed
- The old `admin` and `viewer` roles are retired when this is implemented

### Mapping from old roles

| Old Role | New Role |
|---|---|
| `admin` (all locations paid ads) | `paid_ads` |
| `viewer` (assigned locations paid ads) | `paid_ads` + `user_location_access` rows |
| *(new)* | `super_admin` |
| *(new)* | `cmo` |
| *(new)* | `seo` |
| *(new)* | `social_media` |

---

## Updated Dashboard Routes

```
/dashboard/paid-ads/executive         → super_admin, cmo, paid_ads (all-location)
/dashboard/paid-ads/[location]        → super_admin, cmo, paid_ads (all or assigned)
/dashboard/seo/[location]             → super_admin, cmo, seo
/dashboard/social/[location]          → super_admin, cmo, social_media
```

### What each route shows

**`/dashboard/paid-ads/executive`**
- All-locations aggregate: total spend, leads, CPL, spend share by location
- Same as current `/dashboard/executive` — just relocated

**`/dashboard/paid-ads/[location]`**
- Per-location paid ads: KPI band, spend trend, conversions chart, platform cards, top campaigns
- Same as current `/dashboard/[location]` — just relocated

**`/dashboard/seo/[location]`**
- Organic search performance: clicks, impressions, CTR, average position
- Top pages by clicks
- Top queries
- Position trend over time
- Source: Google Search Console

**`/dashboard/social/[location]`**
- Organic social performance per platform (Facebook, Instagram, TikTok organic)
- Reach, impressions, engagements, follower growth
- Posts published
- Engagement rate trend
- Source: Meta Page Insights API, TikTok for Business API

---

## Sidebar Navigation

Users see only the sections their role grants access to. The sidebar groups links by channel:

```
PAID ADS               (visible to: super_admin, cmo, paid_ads)
  Executive
  San Antonio
  Las Vegas
  ...

SEO                    (visible to: super_admin, cmo, seo)
  San Antonio
  Las Vegas
  ...

SOCIAL MEDIA           (visible to: super_admin, cmo, social_media)
  San Antonio
  Las Vegas
  ...
```

The logo click (currently goes to `/dashboard/executive`) will go to the first accessible dashboard for the user's role.

---

## Database Schema Changes

### Updated `user_roles` table

The `role` column CHECK constraint expands from `admin|viewer` to:
```sql
CHECK (role IN ('super_admin', 'cmo', 'paid_ads', 'seo', 'social_media'))
```

`user_location_access` stays as-is — only used by `paid_ads` role with restricted locations.

---

### New table: `daily_seo_metrics`

One row per location × date. Aggregated from Google Search Console.

```sql
CREATE TABLE public.daily_seo_metrics (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text          NOT NULL,
  location_name text          NOT NULL,
  date          date          NOT NULL,
  clicks        integer       NOT NULL DEFAULT 0,
  impressions   integer       NOT NULL DEFAULT 0,
  ctr           numeric(8,4)  NOT NULL DEFAULT 0,   -- as ratio e.g. 0.0312
  avg_position  numeric(6,2),                        -- nullable on first day
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT daily_seo_metrics_uq UNIQUE (location_id, date)
);
```

**Optional extension — `daily_seo_pages`** (top pages per location per day):
```sql
CREATE TABLE public.daily_seo_pages (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text  NOT NULL,
  date          date  NOT NULL,
  page_url      text  NOT NULL,
  clicks        integer NOT NULL DEFAULT 0,
  impressions   integer NOT NULL DEFAULT 0,
  ctr           numeric(8,4),
  avg_position  numeric(6,2),
  CONSTRAINT daily_seo_pages_uq UNIQUE (location_id, date, page_url)
);
```

---

### New table: `daily_social_metrics`

One row per location × platform × date.

```sql
CREATE TABLE public.daily_social_metrics (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id       text          NOT NULL,
  location_name     text          NOT NULL,
  platform          text          NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok_organic')),
  date              date          NOT NULL,
  reach             integer       NOT NULL DEFAULT 0,
  impressions       integer       NOT NULL DEFAULT 0,
  engagements       integer       NOT NULL DEFAULT 0,   -- likes + comments + shares
  followers         integer,                             -- snapshot at end of day
  posts_published   integer       NOT NULL DEFAULT 0,
  engagement_rate   numeric(8,4),                       -- engagements / reach
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT daily_social_metrics_uq UNIQUE (location_id, platform, date)
);
```

---

## Data Sources & APIs

### SEO — Google Search Console API

**Endpoint:** `https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`

**Metrics per request:** `clicks`, `impressions`, `ctr`, `position`

**Dimensions:** `date`, `page` (for page-level breakdown)

**Auth:** Google OAuth2 (same credential type as Google Ads — can reuse the OAuth flow)

**n8n node:** HTTP Request (POST) with Google OAuth2 credential

**Rate limits:** 1,200 queries/min per project — no issue for daily ingestion

**Setup requirement:** Each location's website must be verified in Google Search Console and the service account must have read access.

**Location → Search Console site URL mapping** (to be filled in):

| Location | Site URL |
|---|---|
| Springfield | `https://springfield.celebratedental.com` (example) |
| San Antonio | `https://sanantonio.celebratedental.com` (example) |
| ... | ... |

---

### Social Media — Meta Page Insights API

**Endpoint:** `https://graph.facebook.com/v25.0/{page_id}/insights`

**Metrics:** `page_impressions`, `page_reach`, `page_engaged_users`, `page_fan_adds`, `page_posts_impressions`

**Auth:** Meta User Access Token (same token used for paid ads)

**n8n node:** HTTP Request (GET)

**Location → Facebook Page ID mapping** (to be filled in):

| Location | Facebook Page ID |
|---|---|
| San Antonio | *(add page ID)* |
| Las Vegas | *(add page ID)* |
| ... | ... |

---

### Social Media — TikTok for Business API (Organic)

**Endpoint:** `https://business-api.tiktok.com/open_api/v1.3/business/get/`

**Metrics:** `profile_views`, `video_views`, `likes`, `comments`, `shares`, `followers_count`

**Auth:** Same TikTok access token as paid ads

**Note:** Organic TikTok analytics require the Business Account API, which is separate from the Ads API. The account needs to be a TikTok Business Account.

---

## n8n Workflow Structure

### New branches per channel

**SEO branch (per location):**
```
Get Req. Dates → Set SEO Config → HTTP Request (Search Console) → Aggregate → Format → Upsert daily_seo_metrics
```

**Social Media branch (per location, per platform):**
```
Get Req. Dates → Set Social Config → HTTP Request (Meta/TikTok) → Aggregate → Format → Upsert daily_social_metrics
```

### Credential security (same rules as paid ads)
- Access tokens → n8n Credentials (Header Auth) — never in Set nodes
- Page IDs, site URLs, location slugs → n8n `.env` file (`$env.VAR_NAME`)

---

## Auth & Middleware Changes

### `getUserAccess()` return type

Expands from `{ userId, role, allowedLocations }` to:

```typescript
interface UserAccess {
  userId: string
  role: 'super_admin' | 'cmo' | 'paid_ads' | 'seo' | 'social_media'
  channels: ('paid_ads' | 'seo' | 'social_media')[]  // derived from role
  allowedLocations: string[]  // only relevant for paid_ads role
}
```

Channel mapping:
```typescript
const ROLE_CHANNELS = {
  super_admin:  ['paid_ads', 'seo', 'social_media'],
  cmo:          ['paid_ads', 'seo', 'social_media'],
  paid_ads:     ['paid_ads'],
  seo:          ['seo'],
  social_media: ['social_media'],
}
```

### Middleware route protection

Current: `pathname.startsWith('/dashboard') && !user` → redirect to `/login`

Updated: also check channel access per route prefix:
- `/dashboard/paid-ads/...` → requires `paid_ads` in user's channels
- `/dashboard/seo/...` → requires `seo` in user's channels
- `/dashboard/social/...` → requires `social_media` in user's channels

### Dashboard layout

One layout per channel (or a shared layout with channel-aware access check). Each layout calls `getUserAccess()` and verifies the user has the right channel before rendering.

---

## Implementation Phases

### Phase 1 — Auth & Routing Restructure
- Update `user_roles` table CHECK constraint
- Update `getUserAccess()` to return `channels`
- Restructure routes: move paid ads to `/dashboard/paid-ads/...`
- Update middleware for multi-channel route protection
- Update sidebar to render channel sections conditionally
- Migrate existing admin/viewer users to new roles

### Phase 2 — SEO Dashboard
- Run schema migration to create `daily_seo_metrics`
- Set up Google Search Console access for all 6 locations
- Build n8n SEO ingestion branch
- Build `/dashboard/seo/[location]` page with:
  - KPI band: clicks, impressions, CTR, avg position
  - Click trend chart (line chart over date range)
  - Position trend chart
  - Top pages table

### Phase 3 — Social Media Dashboard
- Run schema migration to create `daily_social_metrics`
- Set up Meta Page Insights access for all locations
- Set up TikTok Business API access
- Build n8n social ingestion branch (Meta + TikTok organic)
- Build `/dashboard/social/[location]` page with:
  - KPI band: reach, engagements, followers, engagement rate
  - Platform cards (Facebook, Instagram, TikTok organic)
  - Reach trend chart
  - Engagement rate trend

### Phase 4 (Optional) — Cross-Channel Executive View
- Extend `/dashboard/paid-ads/executive` or add `/dashboard/executive` (CMO view)
- Show paid ads + SEO + social KPIs side by side per location
- Useful for CMO — one page with the full picture

---

## Granting Access — SQL Reference

```sql
-- Super admin (developer/you)
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'super_admin');

-- CMO
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'cmo');

-- Paid ads - all locations
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'paid_ads');

-- Paid ads - specific locations only
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'paid_ads');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'san-antonio');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'las-vegas');

-- SEO specialist (all locations automatically)
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'seo');

-- Social media specialist (all locations automatically)
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'social_media');
```

---

## Open Questions (to resolve before implementing)

1. **Google Search Console access** — does each location have its own GSC property, or is it one account with multiple sites? Need verified site URLs per location.
2. **Facebook Page IDs** — need one page ID per location for the Page Insights API.
3. **TikTok organic** — are the TikTok accounts Business Accounts with API access enabled?
4. **Executive cross-channel view** — does the CMO want a single executive page combining all three channels, or separate per-channel executives?
5. **Instagram** — tracked separately from Facebook or combined under Meta? The Meta API returns them separately.
6. **Google Business Profile** — include as part of SEO (reviews, profile views, direction requests) or out of scope?
7. **Historical backfill** — how far back for SEO and social? GSC keeps 16 months; Meta Page Insights keeps 2 years.

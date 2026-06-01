# Celebrate Analytics — n8n Ingestion Workflow

**Active workflow file:** `d:\AI\Reporting System\Celebrate Analytics - Testing.json`
**Status:** Daily ingestion changes documented and ready to apply; TikTok workflow pattern built and verified
**Purpose:** Daily paid ads data ingestion pipeline for Celebrate Dental and Braces.
Pulls performance data from Google Ads, Meta Ads, and TikTok Ads every day, stores one row per location × platform × date in Supabase, and makes it available to the Celebrate Analytics dashboard.

---

## Architecture: Daily Ingestion

| | Old (quarterly) | Current (daily) |
|---|---|---|
| Trigger | Manual / quarterly cron | Daily cron (6 AM) |
| Granularity | Weekly rows + quarterly summaries | One row per day |
| Google Ads param | `segments.week` | `segments.date` |
| Meta Ads param | `time_increment=7` | `time_increment=1` |
| TikTok Ads | Not implemented | `stat_time_day` dimension, 30-day max window |
| Tables | `weekly_metrics`, `quarterly_summary`, `top_campaigns` | `daily_metrics`, `daily_campaigns` |
| Date filter | Full quarter range | Yesterday (or backfill window) |
| Aggregation | Pre-aggregated at ingestion | Computed dynamically at query time |

---

## n8n Workflow Changes Required (Google + Meta)

The existing quarterly test workflow (`Celebrate Analytics - Testing.json`) needs the following changes:

### 1. Schedule Trigger
- Replace the Manual Trigger with a **Schedule Trigger**
- Run daily at **6:00 AM** (`0 6 * * *`)

### 2. Get Req. Dates node
Already built and correct for production:
```javascript
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const d = yesterday.toISOString().split('T')[0];
return [{ json: { date_from: d, date_to: d } }];
```
For initial **backfill**, temporarily set a longer window (e.g. last 90 days) and run once manually.

### 3. Google Ads GAQL query
Change `segments.week` → `segments.date` in the SELECT:
```sql
SELECT
  campaign.id,
  campaign.name,
  segments.date,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM campaign
WHERE segments.date BETWEEN '{date_from}' AND '{date_to}'
```
Each row now represents one **campaign × day** instead of one campaign × week.

### 4. Meta Ads Insights API
Change `time_increment=7` → `time_increment=1`:
```
https://graph.facebook.com/v25.0/act_{account_id}/insights?
  fields=campaign_id,campaign_name,spend,impressions,clicks,actions&
  time_range={"since":"{date_from}","until":"{date_to}"}&
  time_increment=1&
  level=campaign
```

### 5. Format for Supabase — daily_metrics
```javascript
const dailyMap = new Map()
for (const row of rows) {
  const key = `${locationId}::${platform}::${row.date}`
  if (!dailyMap.has(key)) {
    dailyMap.set(key, {
      location_id: locationId,
      location_name: locationName,
      platform: platform,
      date: row.date,
      spend: 0, impressions: 0, clicks: 0, conversions: 0
    })
  }
  const d = dailyMap.get(key)
  d.spend += row.spend
  d.impressions += row.impressions
  d.clicks += row.clicks
  d.conversions += row.conversions
}
// Compute cpl, ctr per row before upsert
```

### 6. Format for Supabase — daily_campaigns
```javascript
const campaignRows = rows.map(row => ({
  location_id: locationId,
  location_name: locationName,
  platform: platform,
  date: row.date,
  campaign_id: row.campaign_id,
  campaign_name: row.campaign_name,
  spend: row.spend,
  impressions: row.impressions,
  clicks: row.clicks,
  conversions: row.conversions,
  cpl: row.conversions > 0 ? row.spend / row.conversions : null,
  ctr: row.impressions > 0 ? row.clicks / row.impressions : null,
}))
```

### 7. Supabase Upsert nodes
| Old table | New table | Conflict columns |
|---|---|---|
| `weekly_metrics` | `daily_metrics` | `location_id, platform, date` |
| `quarterly_summary` | *(removed)* | — |
| `top_campaigns` | `daily_campaigns` | `location_id, platform, date, campaign_id` |

---

## TikTok Ads Workflow (Built & Verified)

### Node pattern
```
Get Req. Dates → Set TikTok Config → HTTP Request → Code (transform) → IF (_table)
  ├── daily_metrics  → Code (strip _table) → Supabase Upsert [daily_metrics]
  └── daily_campaigns → Code (strip _table) → Supabase Upsert [daily_campaigns]
```

### Set TikTok Config node
Fields (use n8n env vars — do NOT hardcode):
```
advertiser_id   → {{ $env.TIKTOK_ADVERTISER_ID_<LOCATION> }}
location_id     → {{ $env.TIKTOK_LOCATION_ID_<LOCATION> }}
location_name   → {{ $env.TIKTOK_LOCATION_NAME_<LOCATION> }}
```
Access token: store in **n8n Credentials → Header Auth** (name: `Access-Token`). Never put in a Set node.

### HTTP Request node
- **Method:** GET
- **URL:** `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/`
- **Authentication:** Header Auth → TikTok credential
- **Query params:**

| Key | Value |
|---|---|
| `advertiser_id` | `{{ $('Set TikTok Config').item.json.advertiser_id }}` |
| `report_type` | `BASIC` |
| `data_level` | `AUCTION_CAMPAIGN` |
| `dimensions` | `["campaign_id","stat_time_day"]` |
| `metrics` | `["campaign_name","spend","impressions","clicks","conversion"]` |
| `start_date` | `{{ $('Get Req. Dates').item.json.date_from }}` |
| `end_date` | `{{ $('Get Req. Dates').item.json.date_to }}` |
| `page_size` | `100` |
| `page` | `1` |

> **30-day limit:** TikTok only allows 30-day windows with `stat_time_day`. Production workflow fetches yesterday only (1 day) — no issue. For backfills, use a Code node to chunk into 30-day windows before the HTTP Request.

### Code (transform) node — Run Once for All Items
```javascript
const raw = $input.first().json
const response = Array.isArray(raw) ? raw[0] : raw
const rows = response?.data?.list
if (!rows || rows.length === 0) return []

const byDate = {}
for (const item of rows) {
  const date = item.dimensions.stat_time_day.slice(0, 10)
  if (!byDate[date]) byDate[date] = { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  byDate[date].spend       += parseFloat(item.metrics.spend)
  byDate[date].impressions += parseInt(item.metrics.impressions)
  byDate[date].clicks      += parseInt(item.metrics.clicks)
  byDate[date].conversions += parseInt(item.metrics.conversion)
}

const metricsRows = Object.entries(byDate).map(([date, m]) => ({
  json: {
    _table:        'daily_metrics',
    location_id:   $('Set TikTok Config').item.json.location_id,
    location_name: $('Set TikTok Config').item.json.location_name,
    platform:      'tiktok',
    date,
    spend:         Math.round(m.spend * 100) / 100,
    impressions:   m.impressions,
    clicks:        m.clicks,
    conversions:   m.conversions,
    cpl:           m.conversions > 0 ? Math.round((m.spend / m.conversions) * 100) / 100 : null,
    ctr:           m.impressions > 0 ? Math.round((m.clicks / m.impressions) * 10000) / 10000 : 0,
  }
}))

const campaignRows = rows.map(item => {
  const spend       = parseFloat(item.metrics.spend)
  const impressions = parseInt(item.metrics.impressions)
  const clicks      = parseInt(item.metrics.clicks)
  const conversions = parseInt(item.metrics.conversion)
  return {
    json: {
      _table:        'daily_campaigns',
      location_id:   $('Set TikTok Config').item.json.location_id,
      location_name: $('Set TikTok Config').item.json.location_name,
      platform:      'tiktok',
      date:          item.dimensions.stat_time_day.slice(0, 10),
      campaign_id:   item.dimensions.campaign_id,
      campaign_name: item.metrics.campaign_name,
      spend:         Math.round(spend * 100) / 100,
      impressions,
      clicks,
      conversions,
      cpl:           conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : null,
      ctr:           impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
    }
  }
})

return [...metricsRows, ...campaignRows]
```

### Code (strip _table) node — on each branch after IF
```javascript
return $input.all().map(item => {
  const { _table, ...rest } = item.json
  return { json: rest }
})
```

### Supabase Upsert nodes
- `daily_metrics`: conflict columns `location_id,platform,date`
- `daily_campaigns`: conflict columns `location_id,platform,date,campaign_id`

---

## Credentials Security

| Credential type | Where to store | Why |
|---|---|---|
| TikTok access token | n8n Credentials → Header Auth | Encrypted at rest, never in exports or logs |
| Google OAuth token | n8n Credentials → Google Ads OAuth | Same |
| Meta access token | n8n Credentials → Header Auth | Same |
| Advertiser IDs, location slugs | n8n `.env` file → `$env.VAR_NAME` | Out of database entirely |

**Never** store access tokens in Set nodes — they appear in workflow JSON exports and execution logs in plaintext.

n8n `.env` example:
```env
TIKTOK_ADVERTISER_ID_SAN_ANTONIO=1759853290066977
TIKTOK_LOCATION_ID_SAN_ANTONIO=san-antonio
TIKTOK_LOCATION_NAME_SAN_ANTONIO=San Antonio
```
Restart n8n after editing `.env`.

---

## New User Notification (Google Chat)

When a user verifies their email for the first time, a Supabase database trigger fires and calls an n8n webhook, which sends a `cardsV2` card to Google Chat.

**Trigger condition:** `email_confirmed_at` transitions from NULL → non-NULL in `auth.users`

**n8n workflow pattern:**
```
Webhook → Code (build cardsV2 card) → HTTP Request → Google Chat webhook URL
```

**Code node output:**
```javascript
const { user_id, email, verified_at } = $input.first().json
const date = new Date(verified_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
return [{ json: { cardsV2: [{ cardId: "user-verified-alert", card: {
  header: { title: "New User Verified", subtitle: "Assign roles to grant dashboard access" },
  sections: [
    { header: "User Details", widgets: [
      { decoratedText: { topLabel: "Email", text: email } },
      { decoratedText: { topLabel: "User ID", text: user_id } },
      { decoratedText: { topLabel: "Verified At", text: date } }
    ]},
    { widgets: [{ buttonList: { buttons: [{ text: "Open Supabase SQL Editor",
      onClick: { openLink: { url: "https://supabase.com/dashboard/project/_/sql/new" } }
    }]}}]}
  ]
}}]}]}
```

---

## Supabase Tables (v2)

Run `supabase-schema-v2.sql` in the Supabase SQL Editor.

### `daily_metrics`
One row per location × platform × calendar day.

| Column | Type | Notes |
|---|---|---|
| `location_id` | `text` | Slug, e.g. `san-antonio` |
| `location_name` | `text` | Display name |
| `platform` | `text` | `google`, `meta`, or `tiktok` |
| `date` | `date` | `YYYY-MM-DD` |
| `spend` | `numeric(10,2)` | USD |
| `impressions` | `integer` | |
| `clicks` | `integer` | |
| `conversions` | `numeric(10,4)` | Fractional (Google reports decimals) |
| `cpl` | `numeric(10,2)` | Nullable when conversions = 0 |
| `ctr` | `numeric(8,4)` | As ratio (e.g. 0.0032) |

**Unique constraint:** `(location_id, platform, date)`

### `daily_campaigns`
One row per location × platform × campaign × calendar day.

| Column | Type | Notes |
|---|---|---|
| `location_id` | `text` | |
| `location_name` | `text` | |
| `platform` | `text` | |
| `date` | `date` | |
| `campaign_id` | `text` | Platform campaign ID |
| `campaign_name` | `text` | |
| `spend` | `numeric(10,2)` | |
| `impressions` | `integer` | |
| `clicks` | `integer` | |
| `conversions` | `numeric(10,4)` | |
| `cpl` | `numeric(10,2)` | Nullable |
| `ctr` | `numeric(8,4)` | Nullable |

**Unique constraint:** `(location_id, platform, date, campaign_id)`

---

## Setup Checklist

### 1. Supabase — Data Tables
- [ ] Run `supabase-schema-v2.sql` in Supabase SQL Editor
- [ ] Copy **Project URL** (Settings → API → Project URL)
- [ ] Copy **Service Role Key** (Settings → API → service_role key)
- [ ] Copy **Anon/Public Key** (Settings → API → anon/public key)

### 2. Supabase — Auth Tables
- [ ] Run `supabase-schema-auth.sql` in Supabase SQL Editor
- [ ] Configure OTP email template (Authentication → Email Templates)

### 3. Environment Variables
Add to `.env.local` in the Next.js app:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

### 4. First Admin Account
1. Go to `/login`, enter your email, enter the OTP code
2. You'll land on `/pending` — expected for first-time users
3. In Supabase SQL Editor:
   ```sql
   SELECT id, email FROM auth.users;
   INSERT INTO user_roles (user_id, role) VALUES ('<your-uuid>', 'admin');
   ```
4. Click "Check dashboard access"

### 5. Grant Viewer Access
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'viewer');
INSERT INTO user_location_access (user_id, location_id) VALUES ('<uuid>', 'san-antonio');
```

### 6. n8n Workflow Updates (Google + Meta)
- [ ] Change trigger → Schedule (daily at 6 AM)
- [ ] Confirm Get Req. Dates outputs yesterday's date
- [ ] Update Google Ads GAQL: `segments.week` → `segments.date`
- [ ] Update Meta Ads API: `time_increment=7` → `time_increment=1`
- [ ] Update format nodes to flat daily rows
- [ ] Update upsert targets → `daily_metrics` + `daily_campaigns`
- [ ] Store access tokens in n8n Credentials (not Set nodes)
- [ ] Run manually with a 90-day backfill to populate history

### 7. TikTok Ads Workflow
- [ ] Create n8n Credential → Header Auth → name: `Access-Token`, value: TikTok access token
- [ ] Add TikTok env vars to n8n `.env`
- [ ] Build workflow using the pattern documented above
- [ ] Test with single day, verify rows appear in `daily_metrics` + `daily_campaigns`

### 8. Google Ads
- [ ] Confirm the `googleAdsOAuth2Api` credential is still valid
- [ ] Developer token: `b7Jj7ADOuQn-eCJnYL9p-g`

### 9. Meta Ads
- [ ] Refresh access token from Meta Business Manager if needed (expires ~60 days)
- [ ] Conversion action type: `lead`

---

## Account & Location Mapping

### Google Ads Accounts (8 locations)
| Location | Customer ID | location_id |
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
| Location | Variable | Account ID | location_id |
|---|---|---|---|
| West Republic (Springfield) | `west_republic` | `885038680320071` | `west-republic` |
| North Glenstone (Springfield) | `n_glenstone` | `2203388956855958` | `north-glenstone` |
| Lindbergh (Springfield) | `n_lindbergh` | `2203220086749865` | `lindbergh` |
| Las Vegas | `las_vegas` | `2267056450490613` | `las-vegas` |
| Olathe (Kansas City) | `olathe` | `4175774955998110` | `olathe` |
| San Antonio | `san_antonio` | `1015442443965530` | `san-antonio` |
| New Mexico | `new_mexico` | `515584627540511` | `new-mexico` |

### TikTok Ads Accounts
| Location | Advertiser ID | location_id |
|---|---|---|
| San Antonio | `1759853290066977` | `san-antonio` |

---

## What's Not Built Yet

- **All 8 Google + 7 Meta locations expanded** — current test workflow covers Springfield (Google) + West Republic (Meta) only
- **TikTok for remaining locations** — San Antonio pattern built; duplicate for other locations as TikTok is added
- **Error alerting** — add a Google Chat or email notification node if workflow fails mid-run
- **GA4 integration** — optional web analytics layer (not required for MVP)
- **FlexBook attribution** — future phase: booked appointment tracking

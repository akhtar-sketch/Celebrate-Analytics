-- ============================================================
-- Celebrate Analytics — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================


-- ── 1. weekly_metrics ────────────────────────────────────────
-- One row per location × platform × week.
-- Powers trend/sparkline charts on each location dashboard.

CREATE TABLE public.weekly_metrics (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text        NOT NULL,
  location_name text        NOT NULL,
  platform      text        NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok')),
  quarter       text        NOT NULL CHECK (quarter  IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year          integer     NOT NULL,
  week_start    date        NOT NULL,
  spend         numeric(10,2) NOT NULL DEFAULT 0,
  impressions   integer     NOT NULL DEFAULT 0,
  clicks        integer     NOT NULL DEFAULT 0,
  conversions   integer     NOT NULL DEFAULT 0,
  cpl           numeric(10,2),          -- nullable when conversions = 0
  ctr           numeric(8,4) NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_metrics_uq UNIQUE (location_id, platform, quarter, year, week_start)
);

CREATE INDEX idx_wm_location_platform ON public.weekly_metrics (location_id, platform, quarter, year);
CREATE INDEX idx_wm_week              ON public.weekly_metrics (week_start);


-- ── 2. quarterly_summary ─────────────────────────────────────
-- One row per location × platform × quarter.
-- Powers KPI cards and quarter-over-quarter delta indicators.

CREATE TABLE public.quarterly_summary (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id            text        NOT NULL,
  location_name          text        NOT NULL,
  platform               text        NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok')),
  quarter                text        NOT NULL CHECK (quarter  IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year                   integer     NOT NULL,
  -- Current quarter totals
  total_spend            numeric(12,2) NOT NULL DEFAULT 0,
  total_impressions      integer     NOT NULL DEFAULT 0,
  total_clicks           integer     NOT NULL DEFAULT 0,
  total_conversions      integer     NOT NULL DEFAULT 0,
  cpl                    numeric(10,2),
  ctr                    numeric(8,4) NOT NULL DEFAULT 0,
  -- Previous quarter for delta calculation
  prev_quarter           text,
  prev_year              integer,
  prev_total_spend       numeric(12,2),
  prev_total_conversions integer,
  prev_cpl               numeric(10,2),
  prev_ctr               numeric(8,4),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quarterly_summary_uq UNIQUE (location_id, platform, quarter, year)
);

CREATE INDEX idx_qs_location ON public.quarterly_summary (location_id, year, quarter);
CREATE INDEX idx_qs_platform ON public.quarterly_summary (platform, year, quarter);


-- ── 3. top_campaigns ─────────────────────────────────────────
-- Top 5 campaigns by spend per location × platform × quarter.
-- Powers the campaigns breakdown table on each location dashboard.

CREATE TABLE public.top_campaigns (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text        NOT NULL,
  location_name text        NOT NULL,
  platform      text        NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok')),
  quarter       text        NOT NULL CHECK (quarter  IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year          integer     NOT NULL,
  campaign_id   text        NOT NULL,
  campaign_name text        NOT NULL,
  spend         numeric(10,2) NOT NULL DEFAULT 0,
  impressions   integer     NOT NULL DEFAULT 0,
  clicks        integer     NOT NULL DEFAULT 0,
  conversions   integer     NOT NULL DEFAULT 0,
  cpl           numeric(10,2),
  ctr           numeric(8,4),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT top_campaigns_uq UNIQUE (location_id, platform, quarter, year, campaign_id)
);

CREATE INDEX idx_tc_location ON public.top_campaigns (location_id, platform, quarter, year);


-- ── Row Level Security ────────────────────────────────────────
-- Service role (used by n8n) gets full access.
-- Authenticated users (dashboard) get read-only access.

ALTER TABLE public.weekly_metrics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_campaigns     ENABLE ROW LEVEL SECURITY;

-- weekly_metrics
CREATE POLICY "service_role_all" ON public.weekly_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read" ON public.weekly_metrics
  FOR SELECT TO authenticated USING (true);

-- quarterly_summary
CREATE POLICY "service_role_all" ON public.quarterly_summary
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read" ON public.quarterly_summary
  FOR SELECT TO authenticated USING (true);

-- top_campaigns
CREATE POLICY "service_role_all" ON public.top_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read" ON public.top_campaigns
  FOR SELECT TO authenticated USING (true);


-- ── updated_at auto-trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_weekly_metrics_updated_at
  BEFORE UPDATE ON public.weekly_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_quarterly_summary_updated_at
  BEFORE UPDATE ON public.quarterly_summary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_top_campaigns_updated_at
  BEFORE UPDATE ON public.top_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── n8n Supabase node: ON CONFLICT columns ───────────────────
-- When using the built-in n8n Supabase node (Upsert operation),
-- set the "Column(s) to Match On" field to:
--   weekly_metrics    → location_id, platform, quarter, year, week_start
--   quarterly_summary → location_id, platform, quarter, year
--   top_campaigns     → location_id, platform, quarter, year, campaign_id

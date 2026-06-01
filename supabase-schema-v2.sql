-- ============================================================
-- Celebrate Analytics — Supabase Schema v2 (Daily Architecture)
-- Run this entire file in the Supabase SQL Editor.
-- Safe to run on a fresh project — drops v1 tables if they exist.
-- ============================================================


-- ── Drop v1 tables (if migrating from weekly schema) ─────────
DROP TABLE IF EXISTS public.top_campaigns CASCADE;
DROP TABLE IF EXISTS public.quarterly_summary CASCADE;
DROP TABLE IF EXISTS public.weekly_metrics CASCADE;


-- ── 1. daily_metrics ─────────────────────────────────────────
-- One row per location × platform × calendar day.
-- All dashboard aggregations (weekly, monthly, quarterly, custom
-- date ranges) are computed at query time from this table.

CREATE TABLE public.daily_metrics (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text          NOT NULL,
  location_name text          NOT NULL,
  platform      text          NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok')),
  date          date          NOT NULL,
  spend         numeric(10,2) NOT NULL DEFAULT 0,
  impressions   integer       NOT NULL DEFAULT 0,
  clicks        integer       NOT NULL DEFAULT 0,
  conversions   numeric(10,4) NOT NULL DEFAULT 0,  -- numeric: Google reports fractional conversions
  cpl           numeric(10,2),                     -- nullable when conversions = 0
  ctr           numeric(8,4)  NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT daily_metrics_uq UNIQUE (location_id, platform, date)
);

CREATE INDEX idx_dm_location_platform ON public.daily_metrics (location_id, platform);
CREATE INDEX idx_dm_date              ON public.daily_metrics (date);
CREATE INDEX idx_dm_location_date     ON public.daily_metrics (location_id, date);


-- ── 2. daily_campaigns ───────────────────────────────────────
-- One row per location × platform × campaign × calendar day.
-- Top campaigns are aggregated at query time for any date range.

CREATE TABLE public.daily_campaigns (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   text          NOT NULL,
  location_name text          NOT NULL,
  platform      text          NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok')),
  date          date          NOT NULL,
  campaign_id   text          NOT NULL,
  campaign_name text          NOT NULL,
  spend         numeric(10,2) NOT NULL DEFAULT 0,
  impressions   integer       NOT NULL DEFAULT 0,
  clicks        integer       NOT NULL DEFAULT 0,
  conversions   numeric(10,4) NOT NULL DEFAULT 0,
  cpl           numeric(10,2),
  ctr           numeric(8,4),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT daily_campaigns_uq UNIQUE (location_id, platform, date, campaign_id)
);

CREATE INDEX idx_dc_location_platform ON public.daily_campaigns (location_id, platform);
CREATE INDEX idx_dc_date              ON public.daily_campaigns (date);
CREATE INDEX idx_dc_location_date     ON public.daily_campaigns (location_id, date);
CREATE INDEX idx_dc_campaign          ON public.daily_campaigns (campaign_id);


-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.daily_metrics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_campaigns  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.daily_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read" ON public.daily_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all" ON public.daily_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read" ON public.daily_campaigns
  FOR SELECT TO authenticated USING (true);


-- ── updated_at auto-trigger ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_daily_campaigns_updated_at
  BEFORE UPDATE ON public.daily_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── n8n Supabase node: upsert conflict columns ───────────────
--   daily_metrics    → location_id, platform, date
--   daily_campaigns  → location_id, platform, date, campaign_id

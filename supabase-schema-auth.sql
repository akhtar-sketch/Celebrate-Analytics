-- Celebrate Analytics — Auth Schema
-- Run this after supabase-schema-v2.sql
-- Adds role-based access control with location-level permissions

-- ── Tables ───────────────────────────────────────────────────────

-- One row per user. All users must have a role before accessing the dashboard.
CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which specific locations a viewer can access.
-- Admin role ignores this table (admins see everything).
CREATE TABLE IF NOT EXISTS user_location_access (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id          ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_user_id       ON user_location_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_location_id   ON user_location_access(location_id);

-- ── RLS ──────────────────────────────────────────────────────────
-- All access goes through the server-side service role key (which bypasses RLS).
-- These policies block any direct client-side access to the permission tables.

ALTER TABLE user_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_access  ENABLE ROW LEVEL SECURITY;

-- No client-side reads/writes — service role only
CREATE POLICY "no direct access" ON user_roles           FOR ALL USING (false);
CREATE POLICY "no direct access" ON user_location_access FOR ALL USING (false);

-- ── Admin helpers ─────────────────────────────────────────────────
-- Run these manually in the Supabase SQL Editor to manage users.

-- Grant admin role (sees all locations + executive dashboard):
-- INSERT INTO user_roles (user_id, role) VALUES ('<user_uuid>', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();

-- Grant viewer role (restricted to specific locations):
-- INSERT INTO user_roles (user_id, role) VALUES ('<user_uuid>', 'viewer')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'viewer', updated_at = now();

-- Assign a location to a viewer:
-- INSERT INTO user_location_access (user_id, location_id) VALUES ('<user_uuid>', 'springfield')
-- ON CONFLICT (user_id, location_id) DO NOTHING;

-- Valid location_id values:
--   springfield, san-antonio, las-vegas, chicago,
--   austin-main, new-mexico, kansas-city, austin-ed

-- List all users + roles:
-- SELECT u.email, r.role, r.created_at
-- FROM auth.users u
-- LEFT JOIN user_roles r ON r.user_id = u.id
-- ORDER BY u.created_at DESC;

-- List a viewer's allowed locations:
-- SELECT la.location_id FROM user_location_access la WHERE la.user_id = '<user_uuid>';

-- Invite a new user (run via API or Supabase dashboard):
-- The Supabase "Invite user" button in Auth → Users sends an invite email.
-- After they accept, add their role using the INSERT statements above.
-- The invite redirect URL must be set to: https://your-domain.com/auth/callback

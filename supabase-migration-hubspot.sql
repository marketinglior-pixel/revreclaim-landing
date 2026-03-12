-- ============================================================
-- HubSpot CRM Integration — scan_configs columns
-- Run in Supabase SQL Editor
-- ============================================================

-- Add HubSpot integration columns to scan_configs
ALTER TABLE scan_configs
  ADD COLUMN IF NOT EXISTS hubspot_token_encrypted TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hubspot_portal_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hubspot_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Index for quick lookup of users with HubSpot enabled
CREATE INDEX IF NOT EXISTS idx_scan_configs_hubspot_enabled
  ON scan_configs (user_id)
  WHERE hubspot_enabled = TRUE;

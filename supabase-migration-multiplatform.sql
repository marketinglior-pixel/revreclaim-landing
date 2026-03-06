-- Multi-platform support migration
-- Adds platform column to reports and scan_configs tables

-- 1. Add platform column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'stripe';

-- 2. Add platform column to scan_configs table
ALTER TABLE scan_configs ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'stripe';

-- 3. Drop existing unique constraint (user_id only)
-- and replace with user_id + platform unique constraint
-- This allows one auto-scan config per platform per user
ALTER TABLE scan_configs DROP CONSTRAINT IF EXISTS scan_configs_user_id_key;
ALTER TABLE scan_configs ADD CONSTRAINT scan_configs_user_platform_unique UNIQUE (user_id, platform);

-- 4. Index for faster queries by platform
CREATE INDEX IF NOT EXISTS idx_reports_platform ON reports (platform);
CREATE INDEX IF NOT EXISTS idx_scan_configs_platform ON scan_configs (platform);

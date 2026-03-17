-- Migration: Add recovered_amount_cents to leak_dismissals
-- Purpose: Track how much revenue was recovered when user fixes a leak (marks as intentional/fixed)
-- This enables "Revenue Recovered This Month" feature on report page + weekly email.

ALTER TABLE leak_dismissals
  ADD COLUMN IF NOT EXISTS recovered_amount_cents INTEGER DEFAULT 0;

-- Index for aggregating recovered revenue per user per month
CREATE INDEX IF NOT EXISTS idx_leak_dismissals_user_created
  ON leak_dismissals(user_id, created_at);

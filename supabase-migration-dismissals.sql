-- Migration: leak_dismissals table
-- Purpose: Store user decisions to mark leaks as intentional (e.g., grandfathered pricing)
-- These dismissed leaks are filtered out from future reports.

CREATE TABLE IF NOT EXISTS leak_dismissals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  leak_type TEXT NOT NULL,
  reason TEXT DEFAULT 'intentional',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, customer_id, leak_type)
);

-- Enable Row Level Security
ALTER TABLE leak_dismissals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own dismissals
CREATE POLICY "Users manage own dismissals"
  ON leak_dismissals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups when loading report
CREATE INDEX IF NOT EXISTS idx_leak_dismissals_user
  ON leak_dismissals(user_id);

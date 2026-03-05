-- ============================================================
-- RevReclaim: Full Database Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Add billing columns to profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scan_count_this_period INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- 2. Create team_members table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invite_status TEXT NOT NULL DEFAULT 'pending' CHECK (invite_status IN ('pending', 'accepted')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(team_owner_id, member_email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team owners can manage their members
CREATE POLICY "Team owners can manage members"
  ON public.team_members FOR ALL
  USING (auth.uid() = team_owner_id);

-- Members can view their own membership
CREATE POLICY "Members can view own membership"
  ON public.team_members FOR SELECT
  USING (auth.uid() = member_id);

-- Service role manages team (for webhooks, crons)
CREATE POLICY "Service role manages team"
  ON public.team_members FOR ALL
  USING (auth.role() = 'service_role');

-- Team members can view team owner's reports
CREATE POLICY "Team members view shared reports"
  ON public.reports FOR SELECT
  USING (user_id IN (
    SELECT team_owner_id FROM public.team_members
    WHERE member_id = auth.uid() AND invite_status = 'accepted'
  ));

-- 3. Create analytics_events table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name
  ON public.analytics_events(event_name);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON public.analytics_events(created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only service role can write analytics
CREATE POLICY "Service role manages analytics"
  ON public.analytics_events FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Done! You should see "Success. No rows returned" for each statement.
-- ============================================================

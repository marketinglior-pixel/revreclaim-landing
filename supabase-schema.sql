-- RevReclaim Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Reports table (stores scan results)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary JSONB NOT NULL,
  categories JSONB NOT NULL,
  leaks JSONB NOT NULL,
  stripe_account_id TEXT,
  is_test_mode BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- 3. Scan configs table (for recurring automated scans)
CREATE TABLE IF NOT EXISTS public.scan_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  encrypted_api_key TEXT NOT NULL,
  scan_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (scan_frequency IN ('weekly', 'daily', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_scan_at TIMESTAMPTZ,
  next_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_configs_next_scan ON public.scan_configs(next_scan_at) WHERE is_active = TRUE;

-- 4. Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_configs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. RLS Policies for reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for scan_configs
CREATE POLICY "Users can view own scan config"
  ON public.scan_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scan config"
  ON public.scan_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan config"
  ON public.scan_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan config"
  ON public.scan_configs FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Service role policy for cron jobs (bypasses RLS for automated scans)
-- The service role key is used by the cron job API endpoint
CREATE POLICY "Service role can read all scan configs"
  ON public.scan_configs FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update scan configs"
  ON public.scan_configs FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 9. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scan_configs_updated_at
  BEFORE UPDATE ON public.scan_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

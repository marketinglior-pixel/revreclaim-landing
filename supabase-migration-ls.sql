-- ============================================================
-- RevReclaim: Stripe → Lemon Squeezy Migration
-- Run this in Supabase SQL Editor AFTER the previous migration
-- ============================================================

-- 1. Rename Stripe-specific columns to generic payment columns
DROP INDEX IF EXISTS idx_profiles_stripe_customer_id;

ALTER TABLE public.profiles RENAME COLUMN stripe_customer_id TO payment_customer_id;
ALTER TABLE public.profiles RENAME COLUMN stripe_subscription_id TO payment_subscription_id;

-- 2. Add customer portal URL column (LS provides per-subscription portal URLs)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_portal_url TEXT;

-- 3. Recreate index with new column name
CREATE INDEX IF NOT EXISTS idx_profiles_payment_customer_id
  ON public.profiles(payment_customer_id) WHERE payment_customer_id IS NOT NULL;

-- ============================================================
-- Done! You should see "Success. No rows returned."
-- ============================================================

# RevReclaim — Session Handoff Document

*Last updated: 2026-03-06*

> **Read this file first in any new Claude Code session.**

---

## What Is RevReclaim

RevReclaim is a SaaS that scans Stripe billing accounts for revenue leaks — failed payments, ghost subscriptions, expired coupons, legacy pricing, and more. SaaS founders paste a read-only Stripe API key, get a report in 90 seconds showing real customer names, real dollar amounts, and one-click fix instructions. Free scan forever, paid plans for continuous monitoring.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 (design token system in `globals.css`) |
| **Auth + DB** | Supabase (PostgreSQL + RLS + email/magic link auth) |
| **Payments** | Lemon Squeezy (Store `307459`, migrated from Stripe — Israel merchant issue) |
| **Email** | Resend (transactional + newsletter audience) |
| **Monitoring** | Sentry (error tracking, inactive until DSN configured) |
| **Analytics** | Custom event tracking via Supabase `analytics_events` table |
| **Hosting** | Vercel (auto-deploy on push to `main`) |
| **Repo** | `github.com/marketinglior-pixel/revreclaim-landing` |

---

## What's Complete

### Landing Page
- Hormozi-style copy across all sections (Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA)
- A/B testing system: `hero_headline` + `cta_text` experiments, cookie-based 50/50 split, 30-day persistence
- Newsletter email capture → Resend audience + Google Sheet webhook fallback
- Design token system: consistent colors, typography, spacing via CSS custom properties
- UX/UI audit: 22 issues fixed across 52 files (SVG icons, focus states, reduced motion, button system, animations, glassmorphism, skeleton loading)

### Core Product
- Stripe scan engine: 7 scanner modules (failed payments, ghost subscriptions, expiring cards, expired coupons, never-expiring discounts, legacy pricing, missing payment methods)
- Report viewer with Billing Health Score (0–100), leak category charts, per-leak fix instructions
- PDF + CSV export
- AES-256-GCM encryption for stored Stripe API keys
- IP-based + plan-based rate limiting

### Dashboard
- Animated stats, scan history, onboarding flow
- Auto-scan configuration (weekly cron via Vercel)
- Team management (invite, manage members — Pro/Team plans)
- Account settings + delete account

### Infrastructure
- Supabase auth (email/password + magic link) with middleware route protection
- Lemon Squeezy checkout, billing portal, webhook handler (4 events)
- Email system (Resend templates for welcome, scan results, alerts)
- Sentry error monitoring (client + server + edge configs, global error boundary)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- SEO: robots.txt, sitemap.xml, meta tags

---

## What's Remaining

### Blocking Production
- [ ] **Lemon Squeezy identity verification** — REJECTED, emailed support. Cannot process real payments until resolved.
- [ ] **Resend production domain** — Currently using sandbox (`onboarding@resend.dev`). Need verified sender domain for production email.

### Configuration Needed
- [ ] **Sentry DSN** — Create project at sentry.io, set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` in Vercel
- [ ] **Resend audience** — Create audience in Resend dashboard, set `RESEND_AUDIENCE_ID` in Vercel

### Future Work
- [ ] Unit tests for encryption, stripe-scanner, ab-testing modules
- [ ] Analytics dashboard for A/B test results
- [ ] Custom domain setup
- [ ] Lemon Squeezy payment flow end-to-end testing (currently in test mode)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ENCRYPTION_SECRET` | AES-256 key for encrypting stored Stripe API keys |
| `CRON_SECRET` | Secret for authenticating Vercel cron job requests |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | Sender address for emails |
| `RESEND_AUDIENCE_ID` | Resend audience ID for newsletter signups |
| `GOOGLE_SHEET_WEBHOOK_URL` | Google Apps Script webhook for email backup logging |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error monitoring (empty = disabled) |
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy API key |
| `LEMONSQUEEZY_STORE_ID` | `307459` |
| `LEMONSQUEEZY_STORE_SLUG` | `revreclaim` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature verification |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | `1370202` ($299/mo) |
| `LEMONSQUEEZY_TEAM_VARIANT_ID` | `1370209` ($499/mo) |
| `STRIPE_SECRET_KEY` | Used for scanning customer accounts (not for billing) |

---

## Key Files

### Routes
```
/                    → Landing page (Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA)
/scan                → Standalone scan page (works without login)
/demo                → Demo page with sample report
/dashboard           → Main dashboard (protected)
/dashboard/settings  → Account settings, auto-scan config
/dashboard/team      → Team management (Pro/Team only)
/report/[id]         → Full scan report detail
```

### Core Libraries — `src/lib/`
| File | Purpose |
|------|---------|
| `stripe-scanner.ts` | Orchestrates all 7 Stripe scans |
| `scanners/` (7 files) | Individual scanner modules |
| `encryption.ts` | AES-256-GCM for Stripe API keys |
| `analytics.ts` | Event tracking (Supabase) |
| `ab-testing.ts` | Cookie-based A/B test variant assignment |
| `lemonsqueezy.ts` | LS checkout + billing portal |
| `email.ts` + `email-templates.ts` | Email via Resend |
| `plan-limits.ts` | Rate limiting by plan (free/pro/team) |
| `rate-limit.ts` | IP-based rate limiting |
| `supabase/client.ts` | Client-side Supabase |
| `supabase/server.ts` | Server-side Supabase |

### Config Files (project root)
| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config + Sentry wrapper + security headers |
| `sentry.client.config.ts` | Client-side Sentry init |
| `sentry.server.config.ts` | Server-side Sentry init |
| `sentry.edge.config.ts` | Edge runtime Sentry init |
| `vercel.json` | Vercel config (cron schedules) |

### Hooks — `src/hooks/`
| File | Purpose |
|------|---------|
| `useExperiment.ts` | A/B test hook (variant + trackConversion) |
| `useSectionView.ts` | Section visibility tracking |

---

## Pricing Tiers

| Tier | Name | Price | LS Variant |
|------|------|-------|-----------|
| Free | Revenue X-Ray | $0 | — |
| Pro | Revenue Shield | $299/mo | `1370202` |
| Team | Revenue Command Center | $499/mo | `1370209` |

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # Verify production build
npx vitest run     # Run tests
```

# RevReclaim — Session Handoff Document

*Last updated: 2026-03-06*

> **Read this file first in any new Claude Code session.**

---

## What Is RevReclaim

RevReclaim is a SaaS that scans billing platform accounts (Stripe, Lemon Squeezy, Paddle) for revenue leaks — failed payments, stuck subscriptions, expired coupons, legacy pricing, and more. SaaS founders paste a read-only API key, get a report in 90 seconds showing real customer names, real dollar amounts, and one-click fix instructions. Free scan forever, paid plans for continuous monitoring.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 (design token system in `globals.css`) |
| **Auth + DB** | Supabase (PostgreSQL + RLS + email/magic link auth) |
| **Payments** | Polar.sh (org: `revreclaim`, checkout + webhooks + customer portal) |
| **Email** | Resend (verified domain: `revreclaim.com`, transactional + newsletter audience) |
| **Monitoring** | Sentry (error tracking, DSN configured) |
| **Analytics** | Custom event tracking via Supabase `analytics_events` table |
| **Hosting** | Vercel (auto-deploy on push to `main`) |
| **Repo** | `github.com/marketinglior-pixel/revreclaim-landing` |

---

## What's Complete

### Landing Page
- Hormozi-style copy across all sections (Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA)
- Newsletter email capture → Resend audience + Google Sheet webhook fallback
- Design token system: consistent colors, typography, spacing via CSS custom properties
- UX/UI audit: 22 issues fixed across 52 files (SVG icons, focus states, reduced motion, button system, animations, glassmorphism, skeleton loading)

### Core Product
- Multi-platform scan engine: Stripe, Lemon Squeezy, Paddle
- 7 scanner modules per platform (failed payments, stuck subscriptions, expiring cards, expired coupons, never-expiring discounts, legacy pricing, missing payment methods)
- Report viewer with Billing Health Score (0–100), leak category charts, per-leak fix instructions
- PDF + CSV export
- AES-256-GCM encryption for stored API keys
- IP-based + plan-based rate limiting

### Dashboard
- Animated stats, scan history, onboarding flow
- Auto-scan configuration (weekly cron via Vercel)
- Team management (invite, manage members — Pro/Team plans)
- Account settings + delete account

### Infrastructure
- Supabase auth (email/password + magic link) with middleware route protection
- Polar.sh checkout, billing portal, webhook handler (6 subscription events)
- Email system (Resend — verified domain revreclaim.com, templates for welcome, scan results, alerts)
- Resend newsletter audience configured (`RESEND_AUDIENCE_ID`)
- Sentry error monitoring (client + server + edge configs, global error boundary, DSN configured)
- Contact form with rate limiting (3 per IP per 15 min)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- SEO: robots.txt, sitemap.xml, meta tags

---

## What's Remaining

### Testing Needed
- [ ] **Polar checkout flow** — End-to-end test (create checkout → complete → webhook fires → plan updated)
- [ ] **Polar webhook delivery** — Verify events arrive at `/api/webhooks/polar` and update profiles
- [ ] **Email delivery** — Test contact form and newsletter subscribe with verified domain
- [ ] **Sentry** — Trigger test error, verify events appear in Sentry dashboard

### Future Work
- [ ] Unit tests for encryption, stripe-scanner modules
- [ ] Analytics dashboard
- [ ] Custom domain setup (if not using revreclaim.com on Vercel)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ENCRYPTION_SECRET` | AES-256 key for encrypting stored API keys |
| `CRON_SECRET` | Secret for authenticating Vercel cron job requests |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | `RevReclaim <noreply@revreclaim.com>` |
| `RESEND_AUDIENCE_ID` | Resend audience ID for newsletter signups |
| `GOOGLE_SHEET_WEBHOOK_URL` | Google Apps Script webhook for email backup logging |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error monitoring |
| `POLAR_ACCESS_TOKEN` | Polar personal access token |
| `POLAR_WEBHOOK_SECRET` | Polar webhook signing secret (Standard Webhooks format) |
| `POLAR_PRO_PRODUCT_ID` | `7d290e47-3204-4dff-9695-53c88e4b2ce0` ($299/mo) |
| `POLAR_TEAM_PRODUCT_ID` | `ce2c0be0-bfd4-4ef8-a4c2-be60bd6c96ba` ($499/mo) |
| `POLAR_ORGANIZATION_SLUG` | `revreclaim` |

---

## Key Files

### Routes
```
/                    → Landing page (Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA)
/scan                → Standalone scan page (works without login, multi-platform)
/demo                → Demo page with sample report
/dashboard           → Main dashboard (protected)
/dashboard/settings  → Account settings, auto-scan config
/dashboard/team      → Team management (Pro/Team only)
/report/[id]         → Full scan report detail
/contact             → Contact form
```

### Core Libraries — `src/lib/`
| File | Purpose |
|------|---------|
| `stripe-scanner.ts` | Orchestrates all 7 Stripe scans |
| `scanners/` (7 files) | Individual scanner modules |
| `platforms/` | Multi-platform support (Stripe, Lemon Squeezy, Paddle) |
| `encryption.ts` | AES-256-GCM for API keys |
| `analytics.ts` | Event tracking (Supabase) |
| `polar.ts` | Polar.sh checkout, webhook verification, plan mapping |
| `email.ts` + `email-templates.ts` | Email via Resend |
| `plan-limits.ts` | Rate limiting by plan (free/pro/team) |
| `rate-limit.ts` | IP-based rate limiting |
| `supabase/client.ts` | Client-side Supabase |
| `supabase/server.ts` | Server-side Supabase |

### API Routes — `src/app/api/`
| Route | Purpose |
|------|---------|
| `checkout/` | Creates Polar checkout session |
| `billing-portal/` | Returns Polar customer portal URL |
| `webhooks/polar/` | Handles 6 Polar subscription events |
| `scan/` | Runs billing platform scan |
| `contact/` | Contact form (rate limited) |
| `subscribe/` | Newsletter signup → Resend audience |
| `cron/auto-scan/` | Weekly auto-scan cron job |

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
| `useSectionView.ts` | Section visibility tracking |

---

## Pricing Tiers

| Tier | Name | Price | Polar Product ID |
|------|------|-------|-----------------|
| Free | Revenue X-Ray | $0 | — |
| Pro | Revenue Shield | $299/mo | `7d290e47-3204-4dff-9695-53c88e4b2ce0` |
| Team | Revenue Command Center | $499/mo | `ce2c0be0-bfd4-4ef8-a4c2-be60bd6c96ba` |

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # Verify production build
npx vitest run     # Run tests
```

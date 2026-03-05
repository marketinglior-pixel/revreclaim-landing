# RevReclaim — Session Handoff

> **Read this file first in any new Claude Code session.**
> It contains full project context so you can continue seamlessly.

---

## 1. Project Overview

| | |
|---|---|
| **Product** | RevReclaim — SaaS that scans Stripe billing accounts for revenue leaks |
| **Target** | SaaS founders doing $30K-$500K MRR on Stripe |
| **Stack** | Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript |
| **Auth** | Supabase Auth (email/password + magic link) |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Billing** | Lemon Squeezy (migrated from Stripe — Israel merchant issue) |
| **Email** | Resend (⚠️ not yet configured) |
| **Hosting** | Vercel (auto-deploy on push to `main`) |
| **Repo** | `github.com/marketinglior-pixel/revreclaim-landing` |

---

## 2. Architecture Map

### Routes

**Public (Landing/Marketing):**
```
/                    → Main landing page (Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA)
/scan                → Standalone scan page (works without login)
/demo                → Demo page with sample report
/contact             → Contact page
/privacy             → Privacy policy
/terms               → Terms of service
/robots.ts           → SEO robots
/sitemap.ts          → SEO sitemap
```

**Auth:**
```
/auth/login          → Login (password + magic link)
/auth/signup         → Signup
/auth/forgot-password → Password reset request
/auth/reset-password → Password reset
/auth/callback       → OAuth/magic link callback
```

**Dashboard (Protected — requires auth):**
```
/dashboard           → Main dashboard (stats, reports, onboarding)
/dashboard/settings  → Account settings, auto-scan config, delete account
/dashboard/team      → Team management (Pro/Team plan only)
/report/[id]         → Full scan report detail page
```

**API Routes:**
```
POST /api/scan             → Execute Stripe scan
POST /api/scan-config      → Configure auto-scan (Pro+)
DELETE /api/scan-config    → Remove auto-scan
GET  /api/stats            → Scan statistics

POST /api/checkout         → Create LS checkout session
POST /api/billing-portal   → Redirect to billing management
POST /api/subscribe        → Mailing list signup

GET/POST /api/team/members → List/invite team members
DELETE   /api/team/members → Remove member
POST     /api/team/invite  → Send invite email
POST     /api/team/accept  → Accept invitation

DELETE /api/account        → Delete user account

POST /api/webhooks/lemonsqueezy → LS payment webhooks

GET /api/cron/weekly-scan      → Automated weekly scans (Vercel Cron)
GET /api/cron/email-sequences  → Automated email sequences
```

### Components

**Landing Page (14 files)** — `src/components/`:
```
Header.tsx, Hero.tsx, Problem.tsx, DashboardPreview.tsx,
HowItWorks.tsx, LeakTypes.tsx, SocialProof.tsx, Pricing.tsx,
FAQ.tsx, FinalCTA.tsx, Footer.tsx, ScanForm.tsx,
ScanCounter.tsx, ApiKeyInstructions.tsx
```

**Dashboard (6 files)** — `src/components/dashboard/`:
```
DashboardNav.tsx, DashboardStats.tsx, HeroRecoveryCard.tsx,
MiniCategoryChart.tsx, ReportsList.tsx, AutoScanBanner.tsx
```

**Report (8 files)** — `src/components/report/`:
```
ReportHeader.tsx, ReportSummary.tsx, HealthScore.tsx,
LeakCategoryChart.tsx, LeakTable.tsx, LeakCard.tsx,
RecoveryBanner.tsx, ReportCTA.tsx
```

### Core Libraries — `src/lib/`

| File | Purpose |
|------|---------|
| `stripe-scanner.ts` | Orchestrates all 7 Stripe scans |
| `scanners/` (7 files) | Individual scanner modules |
| `encryption.ts` | AES-256-GCM for Stripe API keys |
| `email.ts` + `email-templates.ts` | Email via Resend |
| `lemonsqueezy.ts` | LS checkout + billing portal |
| `plan-limits.ts` | Rate limiting by plan (free/pro/team) |
| `rate-limit.ts` | IP-based rate limiting (5 scans/hour) |
| `analytics.ts` | Event tracking |
| `export-pdf.ts` + `export-csv.ts` | Report exports |
| `supabase/client.ts` | Client-side Supabase |
| `supabase/server.ts` | Server-side Supabase |
| `supabase/middleware.ts` | Session management + route protection |

### 7 Scanners — `src/lib/scanners/`
1. `failed-payments.ts` — Uncollected failed charges
2. `ghost-subscriptions.ts` — Active subs with no recent payment
3. `expiring-cards.ts` — Cards expiring within 60 days
4. `expired-coupons.ts` — Coupons past expiry still applied
5. `never-expiring-discounts.ts` — Permanent discounts running forever
6. `legacy-pricing.ts` — Customers on outdated price tiers
7. `missing-payment-methods.ts` — Active subs with no valid payment method

### Database Tables (Supabase)

```sql
profiles (id, email, full_name, plan, created_at, updated_at)
-- plan: 'free' | 'pro' | 'team'
-- RLS: users view/update own profile

reports (id, user_id, created_at, summary, categories, leaks, stripe_account_id, is_test_mode)
-- RLS: users view/insert/delete own reports

scan_configs (id, user_id, encrypted_api_key, scan_frequency, is_active, last_scan_at, next_scan_at)
-- RLS: users manage own config, service role for cron
```

---

## 3. Completed Work (Sprint History)

### Sprint 0: Foundation
- Next.js scaffolding, Tailwind, TypeScript
- Supabase schema, auth system, middleware
- Protected routes, RLS policies

### Sprint 1: Core Product
- Stripe scanning engine (7 scanners)
- Report viewer with health score
- PDF/CSV export
- Security hardening (rate limiting, headers, encryption)

### Sprint 2: Monetization + Polish
- Pricing/billing integration
- Email system (Resend templates)
- Team features (invite, manage members)
- SEO, accessibility, social proof
- Account management (settings, delete)

### Sprint 3: Dashboard + Growth
- Full dashboard with animated stats
- Auto-scan cron jobs (weekly)
- Email sequences
- Demo page for ad campaigns
- Landing page polish (animations, CTA enhancements)

### Sprint 4: UX Polish
- Animated counters, glow effects
- Recovery banners
- Mobile nav fix
- Error boundaries

### Lemon Squeezy Migration
**Why:** Stripe doesn't accept Israeli merchants for processing payments.

| Setting | Value |
|---------|-------|
| Store ID | `307459` |
| Store Slug | `revreclaim` |
| Pro plan | $299/mo — Variant `1370202` |
| Team plan | $499/mo — Variant `1370209` |
| Mode | **Test mode** (identity verification "In Review") |

- Checkout, billing portal, and webhook handler all migrated
- SQL migration run in Supabase (`supabase-migration-ls.sql`) — adds `ls_customer_id`, `ls_subscription_id`, `ls_variant_id` to profiles

### Hormozi Copy Rewrite (Latest — commit `bedfc0c`)
Applied Alex Hormozi's 13 advertising hacks + $100M Offers Value Equation to all landing page copy.

**13 files rewritten:**
- Hero, Problem, LeakTypes, HowItWorks, SocialProof, Pricing, FAQ, FinalCTA
- DashboardPreview, Header, ScanForm, scan/page.tsx, layout.tsx

**Key copy changes:**
- Headlines: moments not descriptions ("$2,340 sitting in Stripe" not "3-5% revenue loss")
- CTAs: physical actions ("Paste Your Key → Get Your Report" not "Scan Now")
- Damaging admissions: Stripe-only, no magic, "we can't help Chargebee users"
- P.S./P.P.S. added to FinalCTA
- Value stacking in Pricing with ROI math
- Tier names: Revenue X-Ray / Revenue Shield / Revenue Command Center

**Key numbers used consistently across all copy:**
- `$2,340/mo` — average recovery
- `90 seconds` — scan time (replaced all "2 minutes")
- `94%` — accounts with leaks
- `847+` — accounts scanned
- `$1,000/mo` — guarantee threshold

---

## 4. Git History (Key Commits)

```
bedfc0c  Rewrite all landing page copy using Hormozi framework
7284523  Fix billing portal fallback to use store slug
b247c74  Fix checkout to use LS API instead of URL-based approach
a487051  Migrate billing from Stripe to Lemon Squeezy
debd8ba  Add SQL migration file and install vitest
1c1a7c9  Complete monetization stack: payments, email, team, analytics, testing
f0a6822  Add demo report page for ad campaigns
05f6ade  Sprint 4: animated counters, glow effects, recovery banners
92b3d55  Sprint 3: social proof, animations, footer, CTA enhancements
2bfaf89  Sprint 2: SEO, accessibility, exports, account management
a5f53b3  Sprint 1: mobile nav, pricing CTAs, error boundaries, forgot password
```

---

## 5. Environment Variables

### ✅ Configured in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID          = 307459
LEMONSQUEEZY_STORE_SLUG        = revreclaim
LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_PRO_VARIANT_ID    = 1370202
LEMONSQUEEZY_TEAM_VARIANT_ID   = 1370209
ENCRYPTION_KEY
CRON_SECRET
STRIPE_SECRET_KEY              (still used for scanning, not billing)
```

### ⚠️ NOT YET Configured:
```
RESEND_API_KEY                 → Need to create at resend.com
EMAIL_FROM                     → Need verified sender domain
```

### Local Development:
Copy `.env.local` from Vercel or create manually with the above variables.

---

## 6. Pending Tasks

### 🔴 Critical (Blocking Production)
- [ ] **Lemon Squeezy identity verification** — Currently "In Review". Cannot process real payments until approved.
- [ ] **Resend email setup** — No emails can be sent. Need `RESEND_API_KEY` and verified sender domain.

### 🟡 Important (Post-Launch Quality)
- [ ] **Lemon Squeezy payment flow testing** — Products in Test mode. Need to test full checkout → webhook → profile update flow.
- [ ] **Visual QA of Hormozi copy** — 13 files rewritten, need browser verification of layout/spacing.
- [ ] **Mobile responsiveness check** — P.S./P.P.S. sections in FinalCTA, value stacking in Pricing.

### 🟢 Nice to Have
- [ ] Dashboard visual polish
- [ ] A/B testing setup for new copy vs. baseline
- [ ] Analytics events for key conversion points
- [ ] Custom domain setup

---

## 7. Copy Framework Reference (Hormozi)

### The 13 Hacks Applied
| # | Hack | Where |
|---|------|-------|
| 1 | Headlines First | Hero, Problem, FinalCTA, layout meta |
| 2 | Say What Only You Can Say | SocialProof stats, Hero proof bar |
| 3 | Call Out Who It's NOT For | Hero badge, 2 new FAQs |
| 4 | Reason Why ("because") | Hero guarantee, Pricing sub, FAQ |
| 5 | Damaging Admissions | HowItWorks, FAQ, FinalCTA P.P.S. |
| 6 | Show Don't Tell (moments) | Problem, LeakTypes, testimonials |
| 7 | Status Tie | Problem, SocialProof, FinalCTA |
| 8 | Urgency/Scarcity | FinalCTA time-decay ($78/day) |
| 9 | Implied Authority | Hero proof bar, SocialProof stats |
| 10 | P.S. Statement | FinalCTA P.S. + P.P.S. |
| 11 | Physical Action CTAs | All buttons |
| 12 | 3rd Grade Reading | All copy |
| 13 | Humor | FAQ headline, LeakTypes "goes to die" |

### Value Equation ($100M Offers)
```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort)

Dream Outcome:  $2,340/mo recovered (specific $, not %)
Likelihood:     94% have leaks + $1,000/mo guarantee
Time Delay:     90 seconds to report
Effort:         Paste one API key. That's it.
```

### Pricing Tiers (Grand Slam Offer)
| Tier | Name | Price | Badge |
|------|------|-------|-------|
| Free | Revenue X-Ray | $0 | FREE FOREVER |
| Pro | Revenue Shield | $299/mo | MOST POPULAR |
| Team | Revenue Command Center | $499/mo | FOR TEAMS |

---

## 8. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:3000

# 3. Verify build
npm run build

# 4. Run tests
npx vitest run
```

### First Message for New Claude Code Session:
```
Read HANDOFF.md at the project root for full context.
This is RevReclaim — a SaaS that scans Stripe for revenue leaks.
All sprints are complete. Hormozi copy rewrite is deployed.
Check "Pending Tasks" section for what still needs to be done.
```

---

## 9. File Tree (Key Files Only)

```
revreclaim-landing/
├── HANDOFF.md                          ← YOU ARE HERE
├── .env.local                          ← Local env vars (not in git)
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Landing page (assembles all sections)
│   │   ├── layout.tsx                  ← Root layout + SEO meta
│   │   ├── scan/page.tsx               ← Standalone scan page
│   │   ├── demo/page.tsx               ← Demo page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx                ← Main dashboard
│   │   │   ├── settings/page.tsx       ← Account settings
│   │   │   └── team/page.tsx           ← Team management
│   │   ├── report/[id]/page.tsx        ← Scan report detail
│   │   └── api/
│   │       ├── scan/route.ts           ← Core scan endpoint
│   │       ├── checkout/route.ts       ← LS checkout
│   │       ├── billing-portal/route.ts ← LS billing portal
│   │       ├── webhooks/lemonsqueezy/route.ts
│   │       ├── cron/weekly-scan/route.ts
│   │       ├── cron/email-sequences/route.ts
│   │       └── team/                   ← Team API routes
│   ├── components/
│   │   ├── Hero.tsx ... FinalCTA.tsx    ← 14 landing page components
│   │   ├── dashboard/                  ← 6 dashboard components
│   │   └── report/                     ← 8 report components
│   ├── lib/
│   │   ├── stripe-scanner.ts           ← Scan orchestrator
│   │   ├── scanners/                   ← 7 scanner modules
│   │   ├── lemonsqueezy.ts             ← LS integration
│   │   ├── encryption.ts               ← AES-256-GCM
│   │   ├── email.ts                    ← Resend integration
│   │   ├── plan-limits.ts              ← Plan enforcement
│   │   ├── rate-limit.ts               ← IP rate limiting
│   │   └── supabase/                   ← Client + server + middleware
│   └── middleware.ts                   ← Route protection
├── supabase-schema.sql                 ← Base DB schema
├── supabase-migration.sql              ← Sprint migrations
├── supabase-migration-ls.sql           ← LS migration (ALREADY RUN)
└── vercel.json                         ← Vercel config (cron schedules)
```

---

*Last updated: 2026-03-05*
*Latest commit: `bedfc0c` — Hormozi copy rewrite*

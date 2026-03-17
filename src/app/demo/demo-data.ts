import type { Leak, LeakType, LeakSeverity, LeakCategorySummary, ScanReport } from "@/lib/types";
import type { LeakEnrichment } from "@/lib/enrichment/types";

// ──────────────────────────────────────────────────────────────
// DEMO SCENARIO: ScaleFlow — A B2B SaaS doing $250K MRR
// They ran RevReclaim and found 100 billing issues.
// Health score: 48 ("Poor") — they scaled fast without billing hygiene.
// All amounts in cents. Risk-adjusted where applicable.
// ──────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────

// Fixed reference date to avoid SSR/client hydration mismatch
const DEMO_NOW = new Date("2026-03-15T10:00:00Z").getTime();

// Deterministic PRNG (mulberry32) — prevents hydration mismatch from Math.random()
let _seed = 0x5EED_CA7E;
function seededRandom(): string {
  _seed |= 0;
  _seed = (_seed + 0x6D2B_79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0).toString(36).padStart(8, "0").slice(0, 12);
}

let leakCounter = 0;
function nextId(): string {
  leakCounter++;
  return `leak-${String(leakCounter).padStart(3, "0")}`;
}

function daysAgo(d: number): string {
  return new Date(DEMO_NOW - d * 86400000).toISOString();
}

function makeLeak(
  type: LeakType,
  severity: LeakSeverity,
  title: string,
  description: string,
  email: string,
  monthlyImpact: number,
  opts: {
    isRecurring?: boolean;
    recoveryRate?: number;
    daysAgo?: number;
    fixSuggestion?: string;
  } = {}
): Leak {
  const isRecurring = opts.isRecurring ?? false;
  const recoveryRate = opts.recoveryRate ?? 0.5;
  const detectedDaysAgo = opts.daysAgo ?? 7;
  const custId = `cus_${seededRandom()}`;
  const subId = `sub_${seededRandom()}`;

  return {
    id: nextId(),
    type,
    severity,
    title,
    description,
    customerEmail: email,
    customerId: custId,
    subscriptionId: subId,
    monthlyImpact,
    annualImpact: isRecurring ? monthlyImpact * 12 : monthlyImpact,
    recoveryRate,
    isRecurring,
    fixSuggestion: opts.fixSuggestion ?? "Review this issue in your Stripe Dashboard and take the recommended action.",
    stripeUrl: `https://dashboard.stripe.com/subscriptions/${subId}`,
    detectedAt: daysAgo(detectedDaysAgo),
    metadata: {},
  };
}

// ── 1. FAILED PAYMENTS (20 leaks) ───────────────────────────

const failedPayments: Leak[] = [
  makeLeak("failed_payment", "critical",
    "Enterprise plan payment failed — 18 days overdue",
    "Invoice #INV-38291 for the Enterprise plan ($899/mo) has been in 'past_due' status for 18 days. Three automatic retry attempts have failed. Card ending 4242 (Visa) declined with 'insufficient_funds'. Customer has been with you for 14 months.",
    "f***@techcorp.io", 89900,
    { daysAgo: 18, recoveryRate: 0.6, fixSuggestion: "Contact the customer immediately via email and phone. Offer to update their payment method. This is your highest-value at-risk customer." }),

  makeLeak("failed_payment", "critical",
    "Pro plan invoice unpaid for 12 days",
    "Invoice #INV-37845 ($499/mo Pro plan) failed 12 days ago. Card ending 8371 (Mastercard) returned 'card_declined'. Customer has 43 active team members. High churn risk.",
    "a***@acmecorp.com", 49900,
    { daysAgo: 12, recoveryRate: 0.6, fixSuggestion: "Send a personalized email from the founder. Include a direct payment link. High team usage — unlikely to intentionally churn." }),

  makeLeak("failed_payment", "critical",
    "Growth plan payment declined twice",
    "Invoice #INV-38102 ($349/mo Growth) failed on initial attempt and first retry. Card ending 5519 (Visa) — 'expired_card'. Next retry in 2 days, but card expiration won't resolve.",
    "j***@startupxyz.io", 34900,
    { daysAgo: 7, recoveryRate: 0.6, fixSuggestion: "Customer's card is expired — automatic retries will continue to fail. Send immediate card update request with Stripe-hosted payment link." }),

  makeLeak("failed_payment", "critical",
    "Enterprise annual plan — $10,788 invoice stuck",
    "Annual Enterprise invoice ($899/mo × 12 = $10,788) failed. Card ending 9012 returned 'generic_decline'. Customer processes 2M API calls/month. This is your #2 account by usage.",
    "c***@megaplatform.io", 89900,
    { daysAgo: 5, recoveryRate: 0.7, fixSuggestion: "Call the CFO directly. For annual payments this large, offer wire transfer as alternative. Don't let this slip through automation." }),

  makeLeak("failed_payment", "high",
    "Team plan — bank transfer payment delayed",
    "Invoice #INV-38204 ($199/mo Team) is 8 days overdue. Payment method is ACH bank transfer. Bank returned 'insufficient_funds'. Customer active for 6 months.",
    "m***@dataflow.com", 19900,
    { daysAgo: 8, recoveryRate: 0.6, fixSuggestion: "Send a payment reminder. For ACH failures, suggest switching to card payment for more reliable billing." }),

  makeLeak("failed_payment", "high",
    "Pro plan — expired card, 3 failed retries",
    "Invoice for $349/mo Pro plan failed 3 times. Card ending 2211 expired 02/2026. Customer has 18 active seats. No response to automated dunning emails.",
    "t***@salesforce-partner.com", 34900,
    { daysAgo: 14, recoveryRate: 0.5, fixSuggestion: "Automated emails aren't working. Try SMS or in-app notification. Customer is heavily embedded — they need a nudge, not a nag." }),

  makeLeak("failed_payment", "high",
    "Growth plan — 'do_not_honor' decline",
    "Invoice #INV-38401 ($249/mo Growth) declined with 'do_not_honor'. Card ending 7654 (Amex). Customer has been active for 8 months with high engagement.",
    "s***@contentai.co", 24900,
    { daysAgo: 6, recoveryRate: 0.6, fixSuggestion: "'Do not honor' often resolves on retry. If second retry fails, send a direct card update link." }),

  makeLeak("failed_payment", "high",
    "Team plan — SCA authentication never completed",
    "Invoice #INV-38500 ($199/mo Team) requires 3D Secure. Payment in 'requires_action' state for 9 days. European customer hasn't completed authentication.",
    "p***@berlintech.de", 19900,
    { daysAgo: 9, recoveryRate: 0.55, fixSuggestion: "Send direct 3DS authentication link with clear instructions. Consider adding in-app banner for EU customers." }),

  makeLeak("failed_payment", "high",
    "Pro plan — declined after bank migration",
    "Customer switched banks last month. Old card ending 3344 now declines. $349/mo Pro plan, 3 retries exhausted.",
    "l***@finops.io", 34900,
    { daysAgo: 11, recoveryRate: 0.65, fixSuggestion: "Customer likely has new card from new bank. Send update link with note about bank change." }),

  makeLeak("failed_payment", "high",
    "Growth plan — corporate card spending limit hit",
    "Invoice for $249/mo Growth declined with 'card_velocity_exceeded'. Customer's corporate card hit monthly limit. Payment attempted on the 28th.",
    "o***@agency360.com", 24900,
    { daysAgo: 4, recoveryRate: 0.7, fixSuggestion: "This is a timing issue — corporate cards reset monthly. Suggest changing billing date to the 1st or adding a backup payment method." }),

  makeLeak("failed_payment", "medium",
    "Starter plan — first payment failed on signup",
    "New customer's first invoice ($99/mo Starter) failed immediately. Card ending 1111 — 'incorrect_cvc'. Customer may have mistyped card details during signup.",
    "n***@newstartup.io", 9900,
    { daysAgo: 2, recoveryRate: 0.4, fixSuggestion: "Send a welcome email with payment update link. Mention the CVC issue specifically — easy fix if they know what went wrong." }),

  makeLeak("failed_payment", "medium",
    "Starter plan payment pending retry",
    "Invoice #INV-38310 ($99/mo Starter) failed initial charge 3 days ago. Card ending 1234 (Amex) — 'do_not_honor'. First automatic retry scheduled for tomorrow.",
    "s***@smallco.io", 9900,
    { daysAgo: 3, recoveryRate: 0.6, fixSuggestion: "Monitor the automatic retry. If it fails again, send a friendly payment update reminder." }),

  makeLeak("failed_payment", "medium",
    "Starter plan — card authentication required",
    "Invoice #INV-38356 ($99/mo Starter) requires 3D Secure authentication. In 'requires_action' state for 5 days.",
    "r***@apihub.dev", 9900,
    { daysAgo: 5, recoveryRate: 0.6, fixSuggestion: "Send the customer a direct link to complete 3D Secure authentication. Include clear instructions." }),

  makeLeak("failed_payment", "medium",
    "Team plan — prepaid card declined",
    "Invoice for $199/mo Team declined — prepaid Visa ending 8888 has insufficient balance. Customer has been paying with prepaid cards for 4 months.",
    "d***@cryptoproject.xyz", 19900,
    { daysAgo: 7, recoveryRate: 0.45, fixSuggestion: "Suggest switching to a standard credit/debit card. Prepaid cards are unreliable for recurring billing." }),

  makeLeak("failed_payment", "medium",
    "Growth plan — fraud flag from bank",
    "Invoice for $249/mo Growth declined with 'fraudulent'. Bank flagged the recurring charge as suspicious. Customer active and engaged.",
    "w***@healthtech.com", 24900,
    { daysAgo: 3, recoveryRate: 0.55, fixSuggestion: "Customer needs to call their bank to whitelist the charge. Send an email explaining what happened with your billing descriptor." }),

  makeLeak("failed_payment", "medium",
    "Starter plan — lost/stolen card replacement",
    "$99/mo Starter plan card ending 5678 reported lost. Bank issued new card but Stripe auto-updater hasn't picked it up yet.",
    "k***@freelance.dev", 9900,
    { daysAgo: 10, recoveryRate: 0.5, fixSuggestion: "Stripe's card updater usually handles this in 3-5 days. Since it's been 10 days, send a manual update request." }),

  makeLeak("failed_payment", "low",
    "Starter plan — temporary bank hold",
    "Invoice for $99/mo Starter returned 'try_again_later'. This is usually a temporary bank-side issue. First occurrence for this customer.",
    "e***@sideproject.co", 9900,
    { daysAgo: 1, recoveryRate: 0.8, fixSuggestion: "No action needed yet. Automatic retry will likely succeed. Monitor for 48 hours." }),

  makeLeak("failed_payment", "low",
    "Starter plan — network timeout during charge",
    "Invoice for $99/mo Starter failed due to payment processor timeout. Card ending 4567 is likely still valid.",
    "g***@devshop.io", 9900,
    { daysAgo: 1, recoveryRate: 0.85, fixSuggestion: "This is a transient network issue. Next retry will almost certainly succeed. No customer action needed." }),

  makeLeak("failed_payment", "low",
    "Team plan — minor processing error",
    "Invoice for $149/mo Team failed with 'processing_error'. Card ending 3210 has worked fine for 7 months. Likely a one-time glitch.",
    "h***@designstudio.co", 14900,
    { daysAgo: 2, recoveryRate: 0.8, fixSuggestion: "Wait for automatic retry. Processing errors are almost always transient." }),

  makeLeak("failed_payment", "low",
    "Starter plan — duplicate charge prevention",
    "Invoice for $99/mo Starter was declined by bank's duplicate charge protection. Two invoices were generated in the same day due to a plan change.",
    "y***@bootstrapped.io", 9900,
    { daysAgo: 1, recoveryRate: 0.75, fixSuggestion: "Void the duplicate invoice in Stripe Dashboard. The correct invoice should process on next retry." }),
];

// ── 2. EXPIRED COUPONS (12 leaks) ───────────────────────────

const expiredCoupons: Leak[] = [
  makeLeak("expired_coupon", "high",
    "50% launch discount expired 4 months ago — still active",
    "Customer paying $199/mo instead of $399/mo with coupon 'LAUNCH50' that expired Nov 2025. Stripe continued applying it because it was applied before expiration.",
    "c***@cloudapp.io", 20000,
    { isRecurring: true, daysAgo: 120, recoveryRate: 0.8, fixSuggestion: "Remove expired coupon. Send heads-up email about standard rate resuming. Offer 20% loyalty discount if needed." }),

  makeLeak("expired_coupon", "high",
    "Beta tester 40% discount — expired 6 months ago",
    "Coupon 'BETA40' expired June 2025 but still active on $499/mo Enterprise sub. Customer paying $299/mo. Meant as 6-month beta incentive.",
    "n***@saasplatform.com", 20000,
    { isRecurring: true, daysAgo: 180, recoveryRate: 0.8, fixSuggestion: "Thank them for being a beta tester. Offer 15% 'Early Adopter' discount as bridge to full pricing." }),

  makeLeak("expired_coupon", "high",
    "Conference promo 30% off — expired 2 months ago",
    "Coupon 'SAASCONF30' from conference promo expired Jan 2026. Customer paying $139/mo instead of $199/mo on Growth plan.",
    "b***@marketingco.io", 6000,
    { isRecurring: true, daysAgo: 60, recoveryRate: 0.8, fixSuggestion: "Remove expired promo code. Notify customer their conference discount has ended." }),

  makeLeak("expired_coupon", "high",
    "Partner program 35% discount — program ended Q4 2025",
    "Coupon 'PARTNER35' from a discontinued partner program. Customer paying $130/mo instead of $199/mo on Growth. Partner program ended 3 months ago.",
    "j***@partnerapp.com", 6900,
    { isRecurring: true, daysAgo: 90, recoveryRate: 0.75, fixSuggestion: "Inform customer that partner program has ended. Offer a transitional 15% discount for 3 months." }),

  makeLeak("expired_coupon", "high",
    "Black Friday 60% off — was supposed to be 3 months only",
    "Coupon 'BF2025' applied as 'forever' instead of 'repeating:3'. Customer on $349/mo Pro paying $139/mo. Been getting 60% off for 5 months now.",
    "r***@ecommtools.io", 21000,
    { isRecurring: true, daysAgo: 150, recoveryRate: 0.7, fixSuggestion: "Configuration error — this was meant to be 3 months. Contact customer, explain the situation, offer 20% as goodwill." }),

  makeLeak("expired_coupon", "medium",
    "Referral 25% discount — should have been one-time",
    "Coupon 'REFER25' meant for first 3 months only but applied as 'forever' on $199/mo sub. 25% off for 9 months.",
    "l***@devtools.co", 5000,
    { isRecurring: true, daysAgo: 270, recoveryRate: 0.8, fixSuggestion: "Remove the coupon. Update referral coupons to 'repeating' duration with 3-month limit going forward." }),

  makeLeak("expired_coupon", "medium",
    "Product Hunt launch 30% — expired 5 months ago",
    "Coupon 'PH30' from Product Hunt launch day. Applied to $199/mo Growth sub, customer paying $139/mo. Coupon expired Oct 2025.",
    "m***@indiehacker.dev", 6000,
    { isRecurring: true, daysAgo: 150, recoveryRate: 0.75, fixSuggestion: "Remove expired PH coupon. Many PH users expect temporary discounts — most will understand." }),

  makeLeak("expired_coupon", "medium",
    "Investor demo 50% — was one-time showcase coupon",
    "Coupon 'DEMO50' created for an investor demo, accidentally applied to a real customer. $249/mo Pro paying $124/mo.",
    "q***@showcase.io", 12500,
    { isRecurring: true, daysAgo: 200, recoveryRate: 0.65, fixSuggestion: "This was never meant for customers. Remove immediately and apologize for the billing error. Offer 1 month free at full price." }),

  makeLeak("expired_coupon", "medium",
    "Early bird 20% — launch period ended 8 months ago",
    "Coupon 'EARLYBIRD20' still active on 2 subscriptions. $99/mo Starter customers paying $79/mo each. Launch period ended July 2025.",
    "a***@earlyuser.com", 2000,
    { isRecurring: true, daysAgo: 240, recoveryRate: 0.8, fixSuggestion: "Remove expired early bird discount. These customers have had 8 months of savings — they got good value." }),

  makeLeak("expired_coupon", "medium",
    "Charity org 25% off — annual review due",
    "Coupon 'NONPROFIT25' on $199/mo Growth. Was granted for 1 year — now 14 months in. Annual review and renewal was missed.",
    "s***@nonprofitorg.org", 5000,
    { isRecurring: true, daysAgo: 60, recoveryRate: 0.5, fixSuggestion: "Review the nonprofit discount policy. Either renew for another year or transition to standard pricing with notice." }),

  makeLeak("expired_coupon", "low",
    "Friend & family 15% — informal agreement expired",
    "Coupon 'FF15' on $99/mo Starter. Informal 6-month discount that's been running for 11 months.",
    "d***@friend.me", 1500,
    { isRecurring: true, daysAgo: 330, recoveryRate: 0.6, fixSuggestion: "Sensitive — this is a personal connection. Have a direct conversation before removing." }),

  makeLeak("expired_coupon", "low",
    "Podcast sponsor 20% off — campaign ended",
    "Coupon 'PODCAST20' from a podcast sponsorship deal. $99/mo Starter paying $79/mo. Campaign ended 4 months ago.",
    "v***@podlistener.fm", 2000,
    { isRecurring: true, daysAgo: 120, recoveryRate: 0.8, fixSuggestion: "Remove expired campaign coupon. Standard pricing resumes next cycle." }),
];

// ── 3. EXPIRING CARDS (14 leaks) ────────────────────────────

const expiringCards: Leak[] = [
  makeLeak("expiring_card", "high",
    "Enterprise customer card expires this month — $270/mo at risk",
    "Card ending 7891 (Visa) on $899/mo Enterprise sub expires 03/2026. Next billing March 28. 30% chance of payment failure.",
    "e***@enterprise.com", 26970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Send urgent card update reminder. Don't rely on Stripe auto-updater for this high-value account." }),

  makeLeak("expiring_card", "high",
    "Pro plan card expires this month — $105/mo at risk",
    "Card ending 3456 (Mastercard) on $349/mo Pro plan expires 03/2026. Customer tenure: 11 months. 30% failure risk.",
    "h***@analytics.io", 10470,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Send proactive card update email with last 4 digits. Include direct link to update." }),

  makeLeak("expiring_card", "high",
    "Two Enterprise cards expiring next month — $540/mo at risk",
    "Two Enterprise accounts ($899/mo each) have cards expiring 04/2026. Combined 30% failure risk = $540/mo at risk.",
    "c***@bigclient.com", 53940,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "High-value accounts — personal outreach from account manager. Don't rely on automated emails." }),

  makeLeak("expiring_card", "high",
    "Pro plan — Amex card expires next month",
    "Card ending 9900 (Amex) on $499/mo Pro expires 04/2026. Amex cards have lower auto-update rates. 35% failure risk.",
    "r***@financeapp.co", 17465,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Amex auto-update rates are lower than Visa/MC. Send manual update request now, don't wait." }),

  makeLeak("expiring_card", "medium",
    "Growth plan card expiring in 2 months — $60/mo at risk",
    "Card ending 6789 (Visa) on $199/mo Growth expires 05/2026. Early warning — 30% failure chance.",
    "w***@webdev.co", 5970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Queue a card expiration reminder for 30 days before expiry." }),

  makeLeak("expiring_card", "medium",
    "Team plan card expiring next month",
    "Card ending 4321 on $199/mo Team plan expires 04/2026. Customer has 12 team members.",
    "b***@teamwork.io", 5970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Send card update reminder with direct payment method link." }),

  makeLeak("expiring_card", "medium",
    "Growth plan — virtual card expiring soon",
    "Virtual card ending 0000 on $249/mo Growth expires 04/2026. Virtual cards rarely auto-update. 45% failure risk.",
    "f***@neobank.co", 11205,
    { daysAgo: 0, recoveryRate: 0.45, fixSuggestion: "Virtual cards don't auto-update. Send update request immediately. Suggest linking a physical card instead." }),

  makeLeak("expiring_card", "medium",
    "Two Starter plan cards expiring soon",
    "Cards on 2 Starter subs ($99/mo each) expire within next 2 months. 30% failure chance per card.",
    "g***@indie.dev", 5940,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Send batch card update reminders. Consider enabling Stripe automatic card updater." }),

  makeLeak("expiring_card", "medium",
    "Pro plan — international card expiring",
    "Card ending 5555 (international Visa) on $349/mo Pro expires 04/2026. International cards have higher failure rates.",
    "i***@globaltech.sg", 13960,
    { daysAgo: 0, recoveryRate: 0.45, fixSuggestion: "International cards fail more often. Send update request with localized payment page link." }),

  makeLeak("expiring_card", "medium",
    "Team plan — debit card expiring this month",
    "Debit card ending 7777 on $149/mo Team expires 03/2026. Debit cards have lower auto-update rates than credit cards.",
    "p***@localshop.com", 5960,
    { daysAgo: 0, recoveryRate: 0.45, fixSuggestion: "Debit cards auto-update less reliably. Send urgent update request before billing date." }),

  makeLeak("expiring_card", "low",
    "Starter plan card expires in 3 months",
    "Card ending 2345 on $99/mo sub expires 06/2026. Low urgency — Stripe auto-updater will likely handle this.",
    "t***@startup.co", 2970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "No immediate action. Monitor and send reminder 30 days before expiry." }),

  makeLeak("expiring_card", "low",
    "Starter plan — card expires in 3 months",
    "Card ending 8765 on $99/mo Starter expires 06/2026. Customer has been reliable for 10 months.",
    "u***@miniapp.io", 2970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Low urgency. Stripe auto-updater handles most of these. Schedule reminder for May." }),

  makeLeak("expiring_card", "low",
    "Team plan card — 4 months out",
    "Card ending 1357 on $149/mo Team expires 07/2026. Very early warning.",
    "z***@calmtech.co", 4470,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "Too early to act. Add to reminder queue for June." }),

  makeLeak("expiring_card", "low",
    "Growth plan card — 4 months out",
    "Card ending 2468 on $199/mo Growth expires 07/2026. Visa card — good auto-update rates.",
    "x***@futureai.co", 5970,
    { daysAgo: 0, recoveryRate: 0.5, fixSuggestion: "No action needed. Visa auto-update success rate is high. Monitor closer to date." }),
];

// ── 4. STUCK SUBSCRIPTIONS (12 leaks) ───────────────────────

const stuckSubs: Leak[] = [
  makeLeak("stuck_subscription", "critical",
    "Enterprise sub in 'past_due' for 45 days — likely churned",
    "Sub ($349/mo) past_due 45 days with no successful payment. All 4 retries failed. No login in 38 days. 50% permanent loss chance.",
    "d***@bigcorp.com", 17450,
    { isRecurring: true, daysAgo: 45, recoveryRate: 0.4, fixSuggestion: "Cancel or pause the subscription. Send win-back campaign in 30 days." }),

  makeLeak("stuck_subscription", "critical",
    "Pro plan stuck 60 days — zero product usage",
    "Sub ($499/mo Pro) past_due 60 days. Zero API calls in last 55 days. Customer email autoresponder says 'out of office indefinitely'.",
    "x***@pivoted-startup.com", 24950,
    { isRecurring: true, daysAgo: 60, recoveryRate: 0.2, fixSuggestion: "This company may have pivoted or shut down. Cancel immediately to stop accruing invoices." }),

  makeLeak("stuck_subscription", "critical",
    "Growth plan — 52 days stuck, bouncing emails",
    "Sub ($249/mo Growth) past_due 52 days. All emails bounce. Domain 'oldcompany.co' no longer resolves. Company likely dissolved.",
    "t***@oldcompany.co", 12450,
    { isRecurring: true, daysAgo: 52, recoveryRate: 0.1, fixSuggestion: "Company is gone. Cancel immediately. Write off the outstanding invoices." }),

  makeLeak("stuck_subscription", "high",
    "Pro sub 'past_due' 22 days — no login in 3 weeks",
    "Pro plan ($249/mo) stuck 22 days. Last API call 19 days ago. Payment method expired. 50% permanent loss chance.",
    "k***@medtech.io", 12450,
    { isRecurring: true, daysAgo: 22, recoveryRate: 0.4, fixSuggestion: "Personal outreach. If no response in 7 days, pause the subscription." }),

  makeLeak("stuck_subscription", "high",
    "Growth plan stuck — 30 days past due",
    "Sub ($199/mo Growth) past due 30 days. Customer email bounces. No login in 28 days.",
    "t***@defunct-startup.com", 9950,
    { isRecurring: true, daysAgo: 30, recoveryRate: 0.4, fixSuggestion: "Email bouncing — company may have shut down. Cancel the subscription." }),

  makeLeak("stuck_subscription", "high",
    "Team plan — past due 25 days, active support ticket",
    "Sub ($199/mo Team) past due 25 days. Interesting: customer opened a support ticket 3 days ago asking about features. They're still interested but haven't fixed payment.",
    "m***@confused-customer.io", 9950,
    { isRecurring: true, daysAgo: 25, recoveryRate: 0.6, fixSuggestion: "Customer is engaged! Reply to their support ticket AND mention the payment issue. High recovery chance." }),

  makeLeak("stuck_subscription", "high",
    "Pro plan — disputing charges, past due 18 days",
    "Sub ($349/mo Pro) past due. Customer filed a dispute on the last successful charge. Chargeback pending.",
    "a***@unhappy-client.com", 17450,
    { isRecurring: true, daysAgo: 18, recoveryRate: 0.3, fixSuggestion: "Handle the dispute first. Contact customer to understand the issue. Offer a refund to withdraw the dispute if appropriate." }),

  makeLeak("stuck_subscription", "medium",
    "Starter plan — 14 days past due, low usage",
    "Sub ($99/mo Starter) past due 14 days. Very low API usage (3 calls last month). 50% permanent loss chance.",
    "p***@freelancer.com", 4950,
    { isRecurring: true, daysAgo: 14, recoveryRate: 0.4, fixSuggestion: "Send 'are you still using us?' email. If no response, cancel and offer free month to come back." }),

  makeLeak("stuck_subscription", "medium",
    "Starter plan — 16 days stuck, seasonal business",
    "Sub ($99/mo Starter) past due 16 days. Customer is a seasonal business (holiday retail). May resume in Q4.",
    "j***@seasonal-shop.com", 4950,
    { isRecurring: true, daysAgo: 16, recoveryRate: 0.35, fixSuggestion: "Offer to pause the subscription until their next season. Better than losing them permanently." }),

  makeLeak("stuck_subscription", "medium",
    "Team plan — 20 days, customer on vacation",
    "Sub ($149/mo Team) past due 20 days. Auto-reply on email says 'On extended leave until April 15'. Payment method needs updating.",
    "l***@on-vacation.com", 7450,
    { isRecurring: true, daysAgo: 20, recoveryRate: 0.55, fixSuggestion: "Customer is on vacation. Set a reminder to follow up after April 15. Don't cancel — they'll be back." }),

  makeLeak("stuck_subscription", "low",
    "Starter plan — 10 days stuck, new customer",
    "Sub ($99/mo Starter) past due 10 days. Customer signed up 3 weeks ago. Might be testing and abandoned.",
    "r***@testing123.dev", 4950,
    { isRecurring: true, daysAgo: 10, recoveryRate: 0.3, fixSuggestion: "New customer who may have abandoned. Send a 'need help getting started?' email along with payment reminder." }),

  makeLeak("stuck_subscription", "low",
    "Starter plan — 8 days past due, active user",
    "Sub ($99/mo Starter) past due 8 days but customer logged in yesterday. Likely just forgot to update card.",
    "c***@busy-founder.io", 4950,
    { isRecurring: true, daysAgo: 8, recoveryRate: 0.7, fixSuggestion: "Customer is active — this is just a card issue. Send a friendly reminder with 1-click update link." }),
];

// ── 5. LEGACY PRICING (10 leaks) ────────────────────────────

const legacyPricing: Leak[] = [
  makeLeak("legacy_pricing", "high",
    "Customer on 2024 pricing — 38% below current rate",
    "Signed up 14 months ago at $149/mo (2024 Growth). Current Growth = $199/mo. Paying 25% less. Price raised 8 months ago but sub never migrated.",
    "r***@bigco.com", 5000,
    { isRecurring: true, daysAgo: 240, recoveryRate: 0.3, fixSuggestion: "Schedule pricing migration. Email with 30-day notice. Offer 10% loyalty discount on new price ($179/mo)." }),

  makeLeak("legacy_pricing", "high",
    "Old Team plan pricing — $50/mo below current",
    "Legacy Team plan at $149/mo. Current Team = $199/mo. Subscribed 18 months ago. Active user with high engagement.",
    "v***@agency.co", 5000,
    { isRecurring: true, daysAgo: 540, recoveryRate: 0.3, fixSuggestion: "Migrate with advance notice. Highlight new features added since signup to justify increase." }),

  makeLeak("legacy_pricing", "high",
    "Enterprise plan — pre-launch pricing, $300/mo gap",
    "Customer on pre-launch Enterprise at $599/mo. Current price $899/mo. They've been getting a $300/mo discount for 20 months without any formal agreement.",
    "t***@earlyenterprise.io", 30000,
    { isRecurring: true, daysAgo: 600, recoveryRate: 0.25, fixSuggestion: "Biggest pricing gap. Schedule a call — don't just email. Propose phased migration: $699 → $799 → $899 over 3 quarters." }),

  makeLeak("legacy_pricing", "high",
    "Pro plan — 2 versions behind current pricing",
    "Customer on V1 Pro at $199/mo. Current Pro V3 = $349/mo. Two price increases missed. Customer is power user with 30+ API calls/day.",
    "g***@poweruser.com", 15000,
    { isRecurring: true, daysAgo: 400, recoveryRate: 0.3, fixSuggestion: "Power user = high switching cost. Migrate to V3 pricing. They'll stay because of deep integration." }),

  makeLeak("legacy_pricing", "medium",
    "Growth plan — $30/mo below current rate",
    "Customer on old Growth at $169/mo. Current = $199/mo. Paying $30/mo less. Moderate usage, been around 12 months.",
    "j***@midsize.co", 3000,
    { isRecurring: true, daysAgo: 365, recoveryRate: 0.35, fixSuggestion: "Small gap, easy migration. Include in next batch price update email. Most customers won't push back on $30/mo." }),

  makeLeak("legacy_pricing", "medium",
    "Starter plan — old $79/mo vs current $99/mo",
    "Customer on legacy Starter at $79/mo. Current Starter = $99/mo. 20% price gap. Low engagement.",
    "h***@hobbyproject.dev", 2000,
    { isRecurring: true, daysAgo: 300, recoveryRate: 0.25, fixSuggestion: "Low engagement = churn risk on price increase. Consider whether this customer is worth migrating." }),

  makeLeak("legacy_pricing", "medium",
    "Team plan — custom deal that was never documented",
    "Customer paying $175/mo for Team plan (current $199/mo). No record of why — likely a verbal agreement with sales.",
    "w***@mystery-deal.com", 2400,
    { isRecurring: true, daysAgo: 450, recoveryRate: 0.3, fixSuggestion: "Document the deal history first. Check with sales team. Then decide whether to honor or migrate." }),

  makeLeak("legacy_pricing", "medium",
    "Growth plan — annual billing at old monthly rate",
    "Customer on annual billing at old $149/mo × 12 = $1,788/yr. Current annual should be $199/mo × 12 = $2,388/yr. $600/yr gap.",
    "f***@annual-deal.io", 5000,
    { isRecurring: true, daysAgo: 365, recoveryRate: 0.3, fixSuggestion: "Update pricing at next annual renewal. Send 60-day notice before renewal date." }),

  makeLeak("legacy_pricing", "low",
    "Starter plan — grandfathered rate, loyal customer",
    "Customer paying $69/mo (original Starter). Current = $99/mo. Has been with you since day 1. Very loyal advocate.",
    "o***@day1-customer.com", 3000,
    { isRecurring: true, daysAgo: 730, recoveryRate: 0.15, fixSuggestion: "Consider keeping this customer grandfathered. They're a brand advocate. The $30/mo may be worth more as goodwill." }),

  makeLeak("legacy_pricing", "low",
    "Team plan — educator discount that became permanent",
    "Customer got educator pricing at $99/mo (vs $199/mo Team). No expiration was set. They may still qualify for educator rates.",
    "p***@university.edu", 10000,
    { isRecurring: true, daysAgo: 500, recoveryRate: 0.2, fixSuggestion: "Verify educator status annually. If still qualified, formalize with a proper educator agreement." }),
];

// ── 6. NEVER-EXPIRING DISCOUNTS (8 leaks) ───────────────────

const neverExpiringDiscounts: Leak[] = [
  makeLeak("never_expiring_discount", "high",
    "Forever 50% discount on Enterprise — billing error",
    "Customer has 'forever' 50% coupon on $899/mo Enterprise. Paying $449/mo. Coupon 'OOPS50' was clearly a testing coupon that leaked to production.",
    "z***@luckycompany.io", 45000,
    { isRecurring: true, daysAgo: 300, recoveryRate: 0.5, fixSuggestion: "This is a clear error. Contact customer, apologize, and transition to full pricing. Offer 1 month free as goodwill." }),

  makeLeak("never_expiring_discount", "high",
    "Forever 40% off Pro — investor referral gone wrong",
    "Coupon 'INVESTOR40' with no expiration on $349/mo Pro. Customer paying $209/mo. Was meant for 6 months only.",
    "i***@referred.vc", 14000,
    { isRecurring: true, daysAgo: 250, recoveryRate: 0.45, fixSuggestion: "Tricky — investor referral. Talk to the investor first, then transition customer. Offer 15% ongoing loyalty." }),

  makeLeak("never_expiring_discount", "medium",
    "Forever 50% on Pro plan — likely a mistake",
    "Customer has 'forever' duration coupon giving 50% off $99/mo Pro. Paying $49.50/mo. Coupon 'FRIEND50' — likely misconfigured referral offer.",
    "z***@friendco.io", 5000,
    { isRecurring: true, daysAgo: 300, recoveryRate: 0.4, fixSuggestion: "Review if this should have had a time limit. Offer 20% ongoing discount as compromise." }),

  makeLeak("never_expiring_discount", "medium",
    "Forever 30% off Growth — sales team override",
    "Coupon 'SALES30' with no expiration on $249/mo Growth. Paying $174/mo. Coupon was created by a former sales rep, no documentation.",
    "b***@sales-deal.com", 7500,
    { isRecurring: true, daysAgo: 200, recoveryRate: 0.4, fixSuggestion: "Undocumented sales deal. Review with current sales lead. Set a sunset date and notify customer." }),

  makeLeak("never_expiring_discount", "medium",
    "Forever 25% off Team — migration incentive that stuck",
    "Coupon 'MIGRATE25' applied when customer migrated from competitor. $199/mo Team paying $149/mo. Was meant for first year only.",
    "k***@switched.co", 5000,
    { isRecurring: true, daysAgo: 400, recoveryRate: 0.45, fixSuggestion: "Migration period is over. Customer is locked in now. Transition to standard pricing with 60-day notice." }),

  makeLeak("never_expiring_discount", "medium",
    "Forever 20% off Growth — customer success gift",
    "CS team applied 'CS20' coupon after a service outage. $199/mo Growth paying $159/mo. Outage was 8 months ago.",
    "e***@compensated.io", 4000,
    { isRecurring: true, daysAgo: 240, recoveryRate: 0.5, fixSuggestion: "Goodwill compensation should have an end date. Set expiration and thank customer for their patience." }),

  makeLeak("never_expiring_discount", "low",
    "Forever 15% off Starter — newsletter subscriber perk",
    "Coupon 'NEWS15' for newsletter subscribers. $99/mo Starter paying $84/mo. Was meant as first-month discount.",
    "n***@newsletter-fan.com", 1500,
    { isRecurring: true, daysAgo: 180, recoveryRate: 0.6, fixSuggestion: "Small amount but sets bad precedent. Fix coupon config for future subscribers, handle existing ones individually." }),

  makeLeak("never_expiring_discount", "low",
    "Forever 10% off Team — loyalty that was never earned",
    "Coupon 'LOYAL10' applied at signup, not after loyalty period. $199/mo Team paying $179/mo.",
    "q***@instant-loyal.co", 2000,
    { isRecurring: true, daysAgo: 150, recoveryRate: 0.55, fixSuggestion: "Small gap. Consider keeping if customer is genuinely loyal now, or remove if they're low-engagement." }),
];

// ── 7. MISSING PAYMENT METHODS (8 leaks) ────────────────────

const missingPayment: Leak[] = [
  makeLeak("missing_payment_method", "high",
    "Active Pro sub with no payment method — billing in 3 days",
    "Customer has active Pro sub ($349/mo) but deleted their payment method yesterday. Next billing in 3 days. 90% failure chance.",
    "u***@deleted-card.io", 31410,
    { daysAgo: 1, recoveryRate: 0.4, fixSuggestion: "URGENT: Billing in 3 days with no payment method. Send immediate email and in-app alert." }),

  makeLeak("missing_payment_method", "high",
    "Enterprise sub — payment method expired and removed",
    "Enterprise customer ($899/mo) had card auto-removed after expiration. No replacement added. Next billing in 5 days.",
    "c***@enterprise-oops.com", 71920,
    { daysAgo: 3, recoveryRate: 0.35, fixSuggestion: "Call the customer directly. Enterprise accounts need personal attention for payment method updates." }),

  makeLeak("missing_payment_method", "medium",
    "Active subscription with no payment method — $79/mo at risk",
    "Customer has active Pro sub ($99/mo) but no valid payment method on file. 80% chance next billing will fail.",
    "j***@newcustomer.io", 7920,
    { daysAgo: 2, recoveryRate: 0.3, fixSuggestion: "Send immediate email asking to add payment method. Include Stripe Checkout link." }),

  makeLeak("missing_payment_method", "medium",
    "Growth plan — backup card removed, primary expiring",
    "Customer removed backup card. Primary card on $249/mo Growth expires next month. If primary fails, no fallback.",
    "m***@onesource.co", 19920,
    { daysAgo: 5, recoveryRate: 0.35, fixSuggestion: "Ask customer to re-add a backup payment method. Highlight the risk of single-card billing." }),

  makeLeak("missing_payment_method", "medium",
    "Team plan — payment method disputed and removed",
    "Customer filed dispute, bank removed the card from Stripe. $199/mo Team sub now has no payment method.",
    "a***@disputed.co", 15920,
    { daysAgo: 4, recoveryRate: 0.25, fixSuggestion: "Resolve the dispute first. Then ask for new payment method. Tread carefully — customer is frustrated." }),

  makeLeak("missing_payment_method", "low",
    "Trial conversion missing card — $37/mo at risk",
    "Signed up for trial 9 days ago. Trial ends in 5 days but no card on file. 80% chance $49/mo sub will fail to convert.",
    "m***@trialuser.com", 3920,
    { daysAgo: 1, recoveryRate: 0.3, fixSuggestion: "Send trial ending reminder with clear CTA to add payment. Include in-app notification too." }),

  makeLeak("missing_payment_method", "low",
    "Starter plan — payment method invalidated by bank",
    "Customer's bank invalidated the card (fraud prevention). $99/mo Starter sub now has no valid payment method. Next billing in 12 days.",
    "s***@bank-issue.com", 7920,
    { daysAgo: 2, recoveryRate: 0.4, fixSuggestion: "Inform customer their bank invalidated the card. They need to add a new one." }),

  makeLeak("missing_payment_method", "low",
    "Growth plan — free trial to paid, no card yet",
    "Customer on 14-day free trial of Growth ($249/mo). Trial ends in 4 days. No payment method added. Engaged user with daily logins.",
    "d***@trialing.dev", 19920,
    { daysAgo: 10, recoveryRate: 0.35, fixSuggestion: "Engaged trial user! Send personalized 'trial ending' email. Emphasize what they'll lose access to." }),
];

// ── 8. UNBILLED OVERAGES (6 leaks) ──────────────────────────

const unbilledOverages: Leak[] = [
  makeLeak("unbilled_overage", "critical",
    "Quantity mismatch: 8 seats but billing for 1",
    "Enterprise sub shows 8 seats but billing only $199/mo instead of $1,592/mo (8 × $199). Per-seat pricing not applied — likely a coupon or manual override.",
    "ops***@scaleco.io", 139300,
    { isRecurring: true, daysAgo: 60, recoveryRate: 0.7, fixSuggestion: "Review quantity and pricing in Stripe. Check for 100% coupons or manual overrides on additional seats." }),

  makeLeak("unbilled_overage", "critical",
    "API usage 5x over plan limit — no overage billing",
    "Customer on Growth ($249/mo, 10K API calls) used 52K calls last month. No overage charges applied. Missing metered billing setup.",
    "a***@heavy-api.com", 104000,
    { isRecurring: true, daysAgo: 30, recoveryRate: 0.6, fixSuggestion: "Set up metered billing for API overages. Backfill last month's overages with notice to customer." }),

  makeLeak("unbilled_overage", "high",
    "15 team members but paying for 5-seat plan",
    "Customer on 5-seat Team plan ($199/mo) has 15 active users. 10 seats unbilled. Should be paying $199/mo + $30/seat × 10 = $499/mo.",
    "t***@growing-team.io", 30000,
    { isRecurring: true, daysAgo: 45, recoveryRate: 0.65, fixSuggestion: "Update seat count in billing. Send notice: 'We noticed your team has grown! Updating billing to reflect 15 seats.'" }),

  makeLeak("unbilled_overage", "high",
    "Storage overage — 3x limit, not billed",
    "Customer on Pro ($349/mo, 100GB storage) using 312GB. No storage overage billing configured. $0.50/GB over limit = $106/mo unbilled.",
    "s***@data-heavy.co", 10600,
    { isRecurring: true, daysAgo: 90, recoveryRate: 0.55, fixSuggestion: "Set up storage overage billing. Grandfather existing usage for 30 days, then start charging." }),

  makeLeak("unbilled_overage", "medium",
    "Seat count increased but billing not updated",
    "Customer added 3 seats to Team plan but billing still reflects original 5 seats. $30/seat × 3 = $90/mo unbilled.",
    "r***@expanding.io", 9000,
    { isRecurring: true, daysAgo: 20, recoveryRate: 0.7, fixSuggestion: "Likely a webhook failure. Update seat count in Stripe and verify seat-change webhooks are working." }),

  makeLeak("unbilled_overage", "medium",
    "Premium feature usage without premium plan",
    "Customer on Starter ($99/mo) accessing Enterprise-only features through an API bug. Using advanced analytics worth $300/mo.",
    "h***@feature-leak.dev", 30000,
    { isRecurring: true, daysAgo: 15, recoveryRate: 0.4, fixSuggestion: "Fix the API access bug first. Then contact customer: offer upgrade path to Enterprise with the features they're already using." }),
];

// ── 9. TRIAL EXPIRED (6 leaks) ──────────────────────────────

const trialExpired: Leak[] = [
  makeLeak("trial_expired", "high",
    "Trial subscription active for 67 days — webhook failure",
    "Sub in 'trialing' status for 67 days. $199/mo Growth plan, 20% conversion chance. Trial-to-paid webhook likely failed.",
    "d***@freetrial.com", 3980,
    { daysAgo: 67, recoveryRate: 0.5, fixSuggestion: "Check trial_end webhook handling. Either convert to paid or cancel. Fix webhook for future trials." }),

  makeLeak("trial_expired", "high",
    "Enterprise trial — 45 days, never converted",
    "Enterprise trial ($899/mo) stuck in 'trialing' for 45 days. Trial was 14 days. Customer had 3 demo calls but never converted.",
    "c***@enterprise-trial.io", 17980,
    { daysAgo: 45, recoveryRate: 0.3, fixSuggestion: "This is a sales pipeline issue. Follow up with a closing call. Offer extended trial if they need more time." }),

  makeLeak("trial_expired", "medium",
    "Pro trial — 30 days over, moderate usage",
    "Pro trial ($349/mo) should have ended 16 days ago. Customer has moderate usage (daily logins). Trial webhook didn't fire.",
    "b***@still-trialing.co", 6980,
    { daysAgo: 30, recoveryRate: 0.45, fixSuggestion: "Customer is using the product — good sign. Send conversion email with urgency: 'Your trial access will end in 48 hours.'" }),

  makeLeak("trial_expired", "medium",
    "Growth trial — 25 days stuck, no card on file",
    "Growth trial ($249/mo) stuck for 25 days. No payment method added. Low engagement (2 logins total).",
    "f***@ghost-trial.io", 4980,
    { daysAgo: 25, recoveryRate: 0.15, fixSuggestion: "Low engagement trial. Cancel the subscription. Add to re-engagement email sequence." }),

  makeLeak("trial_expired", "low",
    "Starter trial — 20 days over, automated email sent",
    "Starter trial ($99/mo) 20 days past expiry. Dunning email was sent but no response. Customer logged in once.",
    "v***@one-login.dev", 1980,
    { daysAgo: 20, recoveryRate: 0.2, fixSuggestion: "Low conversion chance. Cancel and add to win-back campaign. Don't waste more resources." }),

  makeLeak("trial_expired", "low",
    "Team trial — 18 days over, wrong billing plan",
    "Team trial ($199/mo) expired but customer was supposed to be moved to Starter ($99/mo). Migration webhook failed.",
    "g***@wrong-plan.co", 1980,
    { daysAgo: 18, recoveryRate: 0.4, fixSuggestion: "Customer wanted Starter, not Team. Fix the subscription to Starter plan and add payment method." }),
];

// ── 10. DUPLICATE SUBSCRIPTIONS (6 leaks) ───────────────────

const duplicateSubs: Leak[] = [
  makeLeak("duplicate_subscription", "critical",
    "Customer has 2 active subs — upgrade didn't cancel old plan",
    "Upgraded from Growth ($199/mo) to Pro ($249/mo) 3 days ago, but old Growth sub wasn't canceled. Paying $448/mo total. Chargeback risk.",
    "c***@growthco.com", 19900,
    { isRecurring: true, daysAgo: 3, recoveryRate: 0.9, fixSuggestion: "Cancel old Growth sub immediately. Proactively refund the overlap. Fix upgrade flow to auto-cancel." }),

  makeLeak("duplicate_subscription", "critical",
    "3 active subscriptions for same product — billing bug",
    "Customer has 3 active subs: Starter ($99), Growth ($199), Pro ($349). Only Pro should be active. Total overbilling: $298/mo.",
    "w***@triple-billed.io", 29800,
    { isRecurring: true, daysAgo: 7, recoveryRate: 0.95, fixSuggestion: "Cancel Starter and Growth subs immediately. Refund all duplicate charges. Audit upgrade/downgrade webhooks." }),

  makeLeak("duplicate_subscription", "high",
    "Two Team subs — created during checkout retry",
    "Customer clicked 'Subscribe' twice during slow checkout. Two $199/mo Team subs created. They've been double-billed for 2 months.",
    "j***@double-click.com", 19900,
    { isRecurring: true, daysAgo: 60, recoveryRate: 0.9, fixSuggestion: "Cancel duplicate sub. Refund 2 months of double billing ($398). Add idempotency key to checkout." }),

  makeLeak("duplicate_subscription", "high",
    "Duplicate Enterprise subs — API integration error",
    "Two Enterprise subs ($899/mo each) created by a broken API integration. Customer only uses one. $899/mo overbilled.",
    "o***@api-bug.co", 89900,
    { isRecurring: true, daysAgo: 14, recoveryRate: 0.95, fixSuggestion: "Cancel duplicate immediately. Refund the extra $899. Fix API integration to prevent duplicate subscription creation." }),

  makeLeak("duplicate_subscription", "medium",
    "Old and new Starter subs both active after plan change",
    "Customer changed from monthly to annual Starter. Monthly ($99/mo) and annual ($79/mo) both active. Paying $178/mo.",
    "e***@plan-change.io", 9900,
    { isRecurring: true, daysAgo: 30, recoveryRate: 0.9, fixSuggestion: "Cancel the monthly sub. Refund the month of overlap. Review plan-change flow." }),

  makeLeak("duplicate_subscription", "medium",
    "Duplicate Growth subs across two Stripe accounts",
    "Customer is billed for Growth ($249/mo) on both your test and live Stripe accounts. Test account charges are real.",
    "s***@test-vs-live.com", 24900,
    { isRecurring: true, daysAgo: 45, recoveryRate: 0.85, fixSuggestion: "Cancel the test account subscription immediately. Refund all test charges. Review test/live environment separation." }),
];

// ── Combine all leaks ───────────────────────────────────────

export const DEMO_LEAKS: Leak[] = [
  ...failedPayments,      // 20
  ...expiredCoupons,       // 12
  ...expiringCards,        // 14
  ...stuckSubs,            // 12
  ...legacyPricing,        // 10
  ...neverExpiringDiscounts, // 8
  ...missingPayment,       // 8
  ...unbilledOverages,     // 6
  ...trialExpired,         // 6
  ...duplicateSubs,        // 6
];                         // Total: 102

// ── Compute category summaries ──────────────────────────────

function computeCategories(leaks: Leak[]): LeakCategorySummary[] {
  const map = new Map<LeakType, { count: number; total: number }>();
  let grandTotal = 0;

  for (const l of leaks) {
    const entry = map.get(l.type) ?? { count: 0, total: 0 };
    entry.count++;
    entry.total += l.monthlyImpact;
    map.set(l.type, entry);
    grandTotal += l.monthlyImpact;
  }

  const labels: Record<LeakType, string> = {
    expired_coupon: "Expired Coupons",
    never_expiring_discount: "Never-Expiring Discounts",
    failed_payment: "Uncollected Revenue",
    expiring_card: "Expiring Cards",
    stuck_subscription: "Stuck Subscriptions",
    legacy_pricing: "Legacy Pricing",
    missing_payment_method: "Missing Payment Methods",
    unbilled_overage: "Unbilled Overages",
    trial_expired: "Expired Trials",
    duplicate_subscription: "Duplicate Subscriptions",
    stale_coupon: "Stale Coupons",
    billing_churn: "Billing-Caused Churn",
  };

  return Array.from(map.entries()).map(([type, data]) => ({
    type,
    label: labels[type],
    count: data.count,
    totalMonthlyImpact: data.total,
    percentage: Math.round((data.total / grandTotal) * 1000) / 10,
  }));
}

// ── Build the full report ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildSummary(leaks: Leak[], categories: LeakCategorySummary[]) {
  const rawMrrAtRisk = leaks.reduce((s, l) => s + l.monthlyImpact, 0);
  const mrrAtRisk = leaks.reduce((s, l) => s + Math.round(l.monthlyImpact * l.recoveryRate), 0);
  const recoveryPotential = mrrAtRisk * 12;

  return {
    mrrAtRisk,
    rawMrrAtRisk,
    leaksFound: leaks.length,
    recoveryPotential,
    totalSubscriptions: 520,
    totalCustomers: 480,
    totalMRR: 25000000, // $250,000/mo
    trialingMRR: 0,
    healthScore: 48,
  };
}

const categories = computeCategories(DEMO_LEAKS);
const summary = buildSummary(DEMO_LEAKS, categories);

export const DEMO_REPORT: ScanReport = {
  id: "demo-scaleflow-100-2026",
  scannedAt: new Date(DEMO_NOW).toISOString(),
  summary,
  categories,
  leaks: DEMO_LEAKS,
};

// ── Demo CRM Enrichment ─────────────────────────────────────

export function addDemoEnrichment(report: ScanReport) {
  const enrichmentMap: Record<string, LeakEnrichment> = {
    "leak-001": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.6,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "Customer recently active in CRM. High recovery potential.",
      signals: { found: true, daysSinceLastActivity: 3, lifecycleStage: "customer", leadStatus: null, dealCount: 2, tenureDays: 420, engagementLevel: "active", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/101" },
      provider: "hubspot",
    },
    "leak-005": {
      originalSeverity: "high",
      originalRecoveryRate: 0.6,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "Customer inactive in CRM for 52 days. Payment failure may signal churn.",
      signals: { found: true, daysSinceLastActivity: 52, lifecycleStage: "customer", leadStatus: null, dealCount: 0, tenureDays: 180, engagementLevel: "inactive", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/105" },
      provider: "hubspot",
    },
    "leak-021": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.4,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "Stuck sub confirmed — zero CRM activity in 92 days.",
      signals: { found: true, daysSinceLastActivity: 92, lifecycleStage: "customer", leadStatus: null, dealCount: 0, tenureDays: 365, engagementLevel: "inactive", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/121" },
      provider: "hubspot",
    },
    "leak-022": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.2,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "Company appears dissolved — domain no longer resolves.",
      signals: { found: false, daysSinceLastActivity: 999, lifecycleStage: "customer", leadStatus: null, dealCount: 0, tenureDays: 200, engagementLevel: "inactive", hubspotUrl: "" },
      provider: "hubspot",
    },
    "leak-035": {
      originalSeverity: "high",
      originalRecoveryRate: 0.3,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "High-value customer (2 deals, actively engaged). Good pricing conversation candidate.",
      signals: { found: true, daysSinceLastActivity: 2, lifecycleStage: "customer", leadStatus: null, dealCount: 2, tenureDays: 420, engagementLevel: "active", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/135" },
      provider: "hubspot",
    },
    "leak-047": {
      originalSeverity: "high",
      originalRecoveryRate: 0.5,
      severityAdjusted: true,
      recoveryRateAdjusted: true,
      adjustmentReason: "Never-expiring discount + active customer. Worth a conversation.",
      signals: { found: true, daysSinceLastActivity: 5, lifecycleStage: "customer", leadStatus: null, dealCount: 1, tenureDays: 300, engagementLevel: "active", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/147" },
      provider: "hubspot",
    },
    "leak-055": {
      originalSeverity: "high",
      originalRecoveryRate: 0.4,
      severityAdjusted: true,
      recoveryRateAdjusted: true,
      adjustmentReason: "Missing payment + no CRM activity for 38 days. High churn risk.",
      signals: { found: true, daysSinceLastActivity: 38, lifecycleStage: "customer", leadStatus: null, dealCount: 0, tenureDays: 240, engagementLevel: "cooling", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/155" },
      provider: "hubspot",
    },
    "leak-061": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.7,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason: "Unbilled overage on active, engaged customer. Will accept correction.",
      signals: { found: true, daysSinceLastActivity: 1, lifecycleStage: "customer", leadStatus: null, dealCount: 3, tenureDays: 500, engagementLevel: "active", hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/161" },
      provider: "hubspot",
    },
  };

  for (const leak of report.leaks) {
    const enrichment = enrichmentMap[leak.id];
    if (enrichment) {
      leak.enrichment = enrichment;
      if (enrichment.signals.engagementLevel === "active") {
        leak.recoveryRate = Math.min(0.95, leak.recoveryRate + 0.1);
      } else if (enrichment.signals.engagementLevel === "inactive") {
        leak.recoveryRate = Math.max(0.05, leak.recoveryRate - 0.2);
      } else if (enrichment.signals.engagementLevel === "cooling") {
        leak.recoveryRate = Math.max(0.05, leak.recoveryRate - 0.15);
      }
    }
  }

  report.enrichedWith = "hubspot";
}

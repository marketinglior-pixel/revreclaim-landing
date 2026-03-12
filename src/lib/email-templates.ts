/**
 * Email template functions for RevReclaim.
 * All templates use inline CSS for maximum email client compatibility.
 * Dark theme matching the app with green (#10B981) accent.
 */

const BRAND_COLOR = "#10B981";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${BASE_URL}" style="text-decoration:none;color:white;font-size:20px;font-weight:bold;">
        <span style="display:inline-block;width:32px;height:32px;background:${BRAND_COLOR};border-radius:8px;vertical-align:middle;margin-right:8px;text-align:center;line-height:32px;color:#000;font-size:16px;">$</span>
        RevReclaim
      </a>
    </div>

    <!-- Content -->
    <div style="background:#111111;border:1px solid #2A2A2A;border-radius:16px;padding:32px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#666;font-size:12px;">
      <p style="margin:0 0 8px;">RevReclaim — Stop Losing Revenue to Billing Leaks</p>
      <p style="margin:0;">
        <a href="${BASE_URL}" style="color:#666;text-decoration:underline;">Website</a>
        &nbsp;&middot;&nbsp;
        <a href="${BASE_URL}/dashboard" style="color:#666;text-decoration:underline;">Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

function formatCentsAsDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function welcomeEmailHtml(): string {
  return baseLayout("Welcome to RevReclaim", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Welcome to RevReclaim!</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You're all set up. RevReclaim scans your billing platform for revenue leaks — expired coupons,
      failed payments, ghost subscriptions, and more. We support Stripe, Polar, and Paddle.
    </p>

    <h2 style="color:white;font-size:16px;margin:0 0 12px;">Get started in 3 steps:</h2>
    <div style="margin-bottom:24px;">
      <div style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
        <span style="color:${BRAND_COLOR};font-weight:bold;">1.</span>
        <span style="color:#CCC;margin-left:8px;">Run your first free scan</span>
      </div>
      <div style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
        <span style="color:${BRAND_COLOR};font-weight:bold;">2.</span>
        <span style="color:#CCC;margin-left:8px;">Review your Revenue Leak Report</span>
      </div>
      <div style="padding:12px 0;">
        <span style="color:${BRAND_COLOR};font-weight:bold;">3.</span>
        <span style="color:#CCC;margin-left:8px;">Fix leaks directly in your billing dashboard</span>
      </div>
    </div>

    <a href="${BASE_URL}/scan" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Run Your Free Scan
    </a>
  `);
}

export function scanCompleteEmailHtml(summary: {
  leaksFound: number;
  mrrAtRisk: number;
  recoveryPotential: number;
  healthScore: number;
  reportId: string;
}): string {
  const scoreColor = summary.healthScore >= 80 ? BRAND_COLOR : summary.healthScore >= 60 ? "#F59E0B" : "#EF4444";

  return baseLayout("Your Revenue Leak Report is Ready", `
    <h1 style="color:white;font-size:24px;margin:0 0 8px;">Your scan is complete!</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We found <strong style="color:#EF4444;">${summary.leaksFound} revenue leaks</strong> in your billing account.
    </p>

    <!-- Stats Grid -->
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;padding:16px;text-align:center;">
        <div style="color:#EF4444;font-size:24px;font-weight:bold;">${formatCentsAsDollars(summary.mrrAtRisk)}</div>
        <div style="color:#999;font-size:12px;margin-top:4px;">MRR at Risk</div>
      </div>
      <div style="flex:1;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;padding:16px;text-align:center;">
        <div style="color:${BRAND_COLOR};font-size:24px;font-weight:bold;">${formatCentsAsDollars(summary.recoveryPotential)}</div>
        <div style="color:#999;font-size:12px;margin-top:4px;">Annual Recovery</div>
      </div>
      <div style="flex:1;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;padding:16px;text-align:center;">
        <div style="color:${scoreColor};font-size:24px;font-weight:bold;">${summary.healthScore}/100</div>
        <div style="color:#999;font-size:12px;margin-top:4px;">Health Score</div>
      </div>
    </div>

    <a href="${BASE_URL}/report/${summary.reportId}" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      View Full Report
    </a>

    <p style="color:#666;font-size:13px;margin-top:16px;">
      Each leak includes a direct fix link to your billing dashboard.
    </p>
  `);
}

export function upgradeConfirmationEmailHtml(plan: string): string {
  const planName = plan === "watch" ? "Leak Watch" : plan === "pro" ? "Pro" : "Team";
  const price = plan === "watch" ? "$79" : plan === "pro" ? "$299" : "$499";

  return baseLayout(`Welcome to RevReclaim ${planName}!`, `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:48px;height:48px;background:${BRAND_COLOR}20;border-radius:50%;line-height:48px;text-align:center;font-size:24px;">
        🎉
      </div>
    </div>

    <h1 style="color:white;font-size:24px;margin:0 0 8px;text-align:center;">You're on ${planName}!</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
      Your subscription (${price}/month) is now active. Here's what you unlocked:
    </p>

    <div style="margin-bottom:24px;">
      <div style="padding:10px 0;border-bottom:1px solid #2A2A2A;color:#CCC;font-size:14px;">
        <span style="color:${BRAND_COLOR};margin-right:8px;">✓</span> Unlimited revenue leak scans
      </div>
      <div style="padding:10px 0;border-bottom:1px solid #2A2A2A;color:#CCC;font-size:14px;">
        <span style="color:${BRAND_COLOR};margin-right:8px;">✓</span> Weekly automated scanning
      </div>
      <div style="padding:10px 0;border-bottom:1px solid #2A2A2A;color:#CCC;font-size:14px;">
        <span style="color:${BRAND_COLOR};margin-right:8px;">✓</span> Email leak alerts & reports
      </div>
      ${plan === "team" ? `
      <div style="padding:10px 0;border-bottom:1px solid #2A2A2A;color:#CCC;font-size:14px;">
        <span style="color:${BRAND_COLOR};margin-right:8px;">✓</span> Up to 10 team members
      </div>` : ""}
    </div>

    <div style="text-align:center;">
      <a href="${BASE_URL}/dashboard/settings" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
        Set Up Auto-Scans
      </a>
    </div>
  `);
}

export function scanLimitReachedEmailHtml(): string {
  return baseLayout("You've reached your scan limit", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Scan limit reached</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You've used your 1 free scan this month. Upgrade to Pro for unlimited scans,
      weekly automated monitoring, and email alerts.
    </p>

    <div style="background:#0A0A0A;border:1px solid ${BRAND_COLOR}30;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="color:white;font-weight:bold;font-size:16px;margin-bottom:4px;">Pro Plan — $299/month</div>
      <div style="color:#999;font-size:14px;">Unlimited scans + weekly automated monitoring + email alerts</div>
    </div>

    <a href="${BASE_URL}/#pricing" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      View Plans
    </a>
  `);
}

export function paymentFailedEmailHtml(): string {
  return baseLayout("Payment failed", `
    <h1 style="color:#EF4444;font-size:24px;margin:0 0 16px;">Payment failed</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We couldn't process your latest payment. Please update your payment method to keep your subscription active.
    </p>

    <a href="${BASE_URL}/dashboard/settings" style="display:inline-block;background:#EF4444;color:white;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Update Payment Method
    </a>

    <p style="color:#666;font-size:13px;margin-top:16px;">
      If you don't update your payment method, your subscription will be cancelled and you'll be moved to the free plan.
    </p>
  `);
}

export function reminderEmailHtml(): string {
  return baseLayout("Don't forget your free scan", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">You haven't run your first scan yet!</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Most SaaS companies are losing 3-8% of MRR to billing leaks they don't know about.
      Your free scan takes under 2 minutes and finds them all.
    </p>

    <a href="${BASE_URL}/scan" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Start Your Free Scan
    </a>
  `);
}

export function upgradeNudgeEmailHtml(mrrAtRisk: number): string {
  return baseLayout("Your revenue leaks are still open", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Your leaks are still leaking</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Last week you found <strong style="color:#EF4444;">${formatCentsAsDollars(mrrAtRisk)}/month</strong> in revenue leaks.
      Without monitoring, new leaks appear every week.
    </p>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Upgrade to Pro for weekly automated scanning that catches new leaks as they appear.
    </p>

    <a href="${BASE_URL}/#pricing" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Upgrade to Pro — $299/mo
    </a>
  `);
}

export function socialProofEmailHtml(): string {
  return baseLayout("Here's what other founders found", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">SaaS founders are recovering thousands</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Did you know? The average SaaS company has 5-8% of MRR leaking through billing gaps.
      Here's what real founders found with RevReclaim:
    </p>

    <!-- Social proof stats -->
    <div style="margin-bottom:24px;">
      <div style="padding:16px;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;margin-bottom:12px;">
        <div style="color:${BRAND_COLOR};font-size:20px;font-weight:bold;margin-bottom:4px;">$4,200/mo</div>
        <div style="color:#CCC;font-size:14px;">Average MRR at risk found per scan</div>
      </div>
      <div style="padding:16px;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;margin-bottom:12px;">
        <div style="color:${BRAND_COLOR};font-size:20px;font-weight:bold;margin-bottom:4px;">12 leaks</div>
        <div style="color:#CCC;font-size:14px;">Average number of billing leaks per account</div>
      </div>
      <div style="padding:16px;background:#0A0A0A;border:1px solid #2A2A2A;border-radius:12px;">
        <div style="color:${BRAND_COLOR};font-size:20px;font-weight:bold;margin-bottom:4px;">Under 2 min</div>
        <div style="color:#CCC;font-size:14px;">Time to run a complete billing health scan</div>
      </div>
    </div>

    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your scan is free and read-only. We never store your API key.
    </p>

    <a href="${BASE_URL}/scan" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Find Your Leaks Now
    </a>
  `);
}

export function lastChanceEmailHtml(mrrAtRisk: number): string {
  const amount = mrrAtRisk > 0 ? formatCentsAsDollars(mrrAtRisk) : "$2,000+";

  return baseLayout("Your leaks are growing", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Two weeks of unchecked billing leaks</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 16px;">
      It's been 14 days since you found <strong style="color:#EF4444;">${amount}/month</strong> in revenue leaks.
      Without automated monitoring, new leaks appear every week — failed payments, expired cards,
      ghost subscriptions.
    </p>

    <div style="background:#0A0A0A;border:1px solid #EF444430;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="color:#EF4444;font-weight:bold;font-size:18px;margin-bottom:4px;">
        ~${formatCentsAsDollars(mrrAtRisk * 12)} lost per year
      </div>
      <div style="color:#999;font-size:14px;">
        That's how much your billing leaks cost if left unchecked
      </div>
    </div>

    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      RevReclaim Pro runs automated weekly scans and alerts you instantly when new leaks appear.
      Most founders recover their subscription cost within the first scan.
    </p>

    <a href="${BASE_URL}/#pricing" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Start Recovering Revenue — $299/mo
    </a>

    <p style="color:#666;font-size:13px;margin-top:16px;">
      Or <a href="${BASE_URL}/scan" style="color:${BRAND_COLOR};">run another free scan</a> to see what changed.
    </p>
  `);
}

export function teamInviteEmailHtml(inviterEmail: string): string {
  return baseLayout("You've been invited to RevReclaim", `
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Team invite</h1>
    <p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong style="color:white;">${escapeHtml(inviterEmail)}</strong> has invited you to join their RevReclaim team.
      Accept the invite to view shared revenue leak reports.
    </p>

    <a href="${BASE_URL}/auth/signup" style="display:inline-block;background:${BRAND_COLOR};color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
      Accept Invite
    </a>
  `);
}

// ============================================================
// Dunning Email Templates — sent to SaaS end-customers
// ============================================================

function dunningBaseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:11px;">
      <p style="margin:0;">This is an automated billing notification. If you believe you received this in error, please contact support.</p>
    </div>
  </div>
</body>
</html>`.trim();
}

export interface DunningEmailData {
  amountCents?: number;
  invoiceNumber?: string;
  cardLast4?: string;
  cardBrand?: string;
  expMonth?: number;
  expYear?: number;
  billingPortalUrl?: string;
  platformDashboardUrl?: string;
}

export function dunningFailedPaymentHtml(data: DunningEmailData): string {
  const amount = data.amountCents ? formatCentsAsDollars(data.amountCents) : "your recent payment";
  const invoiceRef = data.invoiceNumber ? ` (Invoice ${escapeHtml(data.invoiceNumber)})` : "";
  const portalLink = data.billingPortalUrl || data.platformDashboardUrl || "#";

  return dunningBaseLayout("Action Required: Payment Failed", `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:48px;height:48px;background:#fef2f2;border-radius:50%;line-height:48px;font-size:24px;">&#9888;</div>
    </div>

    <h1 style="color:#111827;font-size:22px;margin:0 0 12px;text-align:center;">Your payment didn't go through</h1>

    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:center;">
      We attempted to charge <strong style="color:#111827;">${amount}</strong>${invoiceRef} but the payment was declined.
      This may be due to an expired card, insufficient funds, or a bank restriction.
    </p>

    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
      To keep your subscription active, please update your payment method:
    </p>

    <div style="text-align:center;">
      <a href="${escapeHtml(portalLink)}" style="display:inline-block;background:#111827;color:#fff;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;">
        Update Payment Method
      </a>
    </div>

    <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center;">
      If you've already updated your payment, you can disregard this email.
    </p>
  `);
}

export function dunningExpiringCardHtml(data: DunningEmailData): string {
  const card = data.cardBrand && data.cardLast4
    ? `${escapeHtml(data.cardBrand)} ending in ${escapeHtml(data.cardLast4)}`
    : "your card on file";
  const expiry = data.expMonth && data.expYear
    ? `${String(data.expMonth).padStart(2, "0")}/${data.expYear}`
    : "soon";
  const portalLink = data.billingPortalUrl || data.platformDashboardUrl || "#";

  return dunningBaseLayout("Heads Up: Your Card Expires Soon", `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:48px;height:48px;background:#fffbeb;border-radius:50%;line-height:48px;font-size:24px;">&#128179;</div>
    </div>

    <h1 style="color:#111827;font-size:22px;margin:0 0 12px;text-align:center;">Your card expires ${escapeHtml(expiry)}</h1>

    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:center;">
      Your <strong style="color:#111827;">${card}</strong> is about to expire.
      To avoid any interruption to your service, please update your payment method before the expiration date.
    </p>

    <div style="text-align:center;">
      <a href="${escapeHtml(portalLink)}" style="display:inline-block;background:#111827;color:#fff;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;">
        Update Payment Method
      </a>
    </div>

    <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center;">
      If you've already updated your card, no further action is needed.
    </p>
  `);
}

export function dunningPaymentUpdateHtml(data: DunningEmailData): string {
  const amount = data.amountCents ? formatCentsAsDollars(data.amountCents) : "your subscription";
  const portalLink = data.billingPortalUrl || data.platformDashboardUrl || "#";

  return dunningBaseLayout("Action Required: Update Your Payment", `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:48px;height:48px;background:#eff6ff;border-radius:50%;line-height:48px;font-size:24px;">&#128274;</div>
    </div>

    <h1 style="color:#111827;font-size:22px;margin:0 0 12px;text-align:center;">Please update your payment method</h1>

    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:center;">
      We're having trouble processing the payment for <strong style="color:#111827;">${amount}</strong>.
      Your subscription may be interrupted if we can't collect payment.
    </p>

    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
      Please update your payment details to keep your account active:
    </p>

    <div style="text-align:center;">
      <a href="${escapeHtml(portalLink)}" style="display:inline-block;background:#111827;color:#fff;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;">
        Update Payment Method
      </a>
    </div>

    <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center;">
      Questions? Reply to this email and we'll help.
    </p>
  `);
}

/**
 * Post-Scan Email Nurture Sequence
 *
 * 4-email drip triggered when a user scans, sees leaks, but doesn't upgrade within 24hrs.
 * Uses Zeigarnik Effect (unfinished tasks create psychological tension) to re-engage.
 *
 * Email 1 (Day 0): Report summary — top 3 leaks + total at risk
 * Email 2 (Day 2): Daily cost focus — biggest leak + how to fix in 3 min
 * Email 3 (Day 5): Degradation — "2 of your leaks are getting worse"
 * Email 4 (Day 10): Scarcity — "Your report expires in 48 hours"
 */

export interface NurtureEmailData {
  email: string;
  reportId: string;
  mrrAtRisk: number; // in cents
  leakCount: number;
  topLeaks: { type: string; impact: number }[]; // impact in cents
  biggestLeak?: { type: string; impact: number; description: string };
  healthScore?: number;
}

export function buildNurtureEmail(
  step: 1 | 2 | 3 | 4,
  data: NurtureEmailData
): { subject: string; html: string } {
  const mrrDollars = Math.round(data.mrrAtRisk / 100);
  const dailyCost = Math.round(mrrDollars / 30);
  const reportUrl = `https://revreclaim.com/auth/signup?redirect=/report/${data.reportId}`;

  switch (step) {
    case 1:
      return {
        subject: `Your billing report: $${mrrDollars}/mo at risk`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
            <h2 style="color:#000;">Your RevReclaim Billing Report</h2>
            <p>We found <strong>${data.leakCount} billing leak${data.leakCount !== 1 ? "s" : ""}</strong> in your account.</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0;font-size:14px;color:#991b1b;">Monthly Revenue at Risk</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#dc2626;">$${mrrDollars}/mo</p>
            </div>
            <h3>Top leaks found:</h3>
            <ul>${data.topLeaks.slice(0, 3).map(l => `<li><strong>${l.type}</strong>: $${Math.round(l.impact / 100)}/mo</li>`).join("")}</ul>
            <p><a href="${reportUrl}" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">View Full Report</a></p>
            <p style="font-size:12px;color:#999;">Create a free account to save this report and track fixes over time.</p>
          </div>
        `,
      };

    case 2:
      return {
        subject: `You're losing $${dailyCost} today. Here's the biggest hole.`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
            <h2 style="color:#000;">Your Daily Cost: $${dailyCost}/day</h2>
            <p>Every day these leaks stay open, you lose $${dailyCost}. That's $${mrrDollars}/month walking out the door.</p>
            ${data.biggestLeak ? `
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;font-size:14px;color:#9a3412;">Your Biggest Leak</p>
                <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#ea580c;">${data.biggestLeak.type}: $${Math.round(data.biggestLeak.impact / 100)}/mo</p>
                <p style="margin:4px 0 0;font-size:13px;color:#666;">${data.biggestLeak.description}</p>
              </div>
            ` : ""}
            <p>Most founders fix this one in under 3 minutes. The fix instructions are in your report.</p>
            <p><a href="${reportUrl}" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">Fix This Leak Now</a></p>
          </div>
        `,
      };

    case 3:
      return {
        subject: `Your billing leaks are getting worse`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
            <h2 style="color:#000;">Your Leaks Are Getting Worse</h2>
            <p>It's been 5 days since your scan. Here's what's happening:</p>
            <ul>
              <li>Failed payments that aren't retried become harder to collect over time</li>
              <li>Expiring cards get closer to failing</li>
              <li>Every day = another $${dailyCost} lost</li>
            </ul>
            <p>Total lost since your scan: approximately <strong>$${dailyCost * 5}</strong></p>
            <p>Your ${data.leakCount} leaks are still waiting to be fixed. The report has step-by-step instructions for each one.</p>
            <p><a href="${reportUrl}" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">View My Leaks</a></p>
          </div>
        `,
      };

    case 4:
      return {
        subject: `Final: your $${mrrDollars}/mo report expires soon`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
            <h2 style="color:#000;">Your Report Is Expiring</h2>
            <p>Your billing report showing $${mrrDollars}/mo in leaks will expire soon if you don't save it.</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0;font-size:14px;color:#991b1b;">Since your scan, you've lost approximately</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#dc2626;">$${dailyCost * 10}</p>
            </div>
            <p>Create a free account to save the report, get fix instructions, and use your free auto-fix action.</p>
            <p><a href="${reportUrl}" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">Save My Report (Free)</a></p>
            <p style="font-size:12px;color:#999;">After this, you'll need to run a new scan to see your leaks again.</p>
          </div>
        `,
      };
  }
}

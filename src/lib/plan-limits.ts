export type PlanType = "free" | "pro" | "team";

export const PLAN_LIMITS = {
  free: { scansPerMonth: 1, autoScans: false, teamMembers: 0, recoveryActions: false },
  pro: { scansPerMonth: Infinity, autoScans: true, teamMembers: 0, recoveryActions: true },
  team: { scansPerMonth: Infinity, autoScans: true, teamMembers: 10, recoveryActions: true },
} as const;

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  pro: 299,
  team: 499,
};

/**
 * Check if a user can run a scan based on their plan and current scan count.
 */
export function canRunScan(
  plan: PlanType,
  scanCountThisPeriod: number
): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[plan];

  if (scanCountThisPeriod >= limits.scansPerMonth) {
    return {
      allowed: false,
      reason:
        plan === "free"
          ? "Free plan allows 1 scan per month. Upgrade to Pro for unlimited scans."
          : "Scan limit reached for this billing period.",
    };
  }

  return { allowed: true };
}

/**
 * Check if a user can enable auto-scans based on their plan.
 */
export function canEnableAutoScan(plan: PlanType): {
  allowed: boolean;
  reason?: string;
} {
  if (!PLAN_LIMITS[plan].autoScans) {
    return {
      allowed: false,
      reason: "Automated scans require a Pro or Team plan. Upgrade to unlock weekly scanning.",
    };
  }
  return { allowed: true };
}

/**
 * Check if a user can use recovery actions (dunning emails, auto-fixes).
 */
export function canUseRecoveryActions(plan: PlanType): {
  allowed: boolean;
  reason?: string;
} {
  if (!PLAN_LIMITS[plan].recoveryActions) {
    return {
      allowed: false,
      reason:
        "Recovery actions require a Pro or Team plan. Upgrade to send dunning emails and auto-fix leaks.",
    };
  }
  return { allowed: true };
}

/**
 * Check if a user can invite team members based on their plan.
 */
export function canInviteTeamMember(
  plan: PlanType,
  currentMemberCount: number
): { allowed: boolean; reason?: string } {
  const maxMembers = PLAN_LIMITS[plan].teamMembers;

  if (maxMembers === 0) {
    return {
      allowed: false,
      reason: "Team members require a Team plan.",
    };
  }

  if (currentMemberCount >= maxMembers) {
    return {
      allowed: false,
      reason: `Team plan allows up to ${maxMembers} members. Contact us to increase your limit.`,
    };
  }

  return { allowed: true };
}

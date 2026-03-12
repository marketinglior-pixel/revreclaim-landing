export type PlanType = "free" | "watch" | "pro" | "team";

export const PLAN_LIMITS: Record<PlanType, {
  scansPerMonth: number;
  autoScans: boolean;
  teamMembers: number;
  recoveryActions: boolean | number; // number = limited free actions, true = unlimited, false = none
}> = {
  free: { scansPerMonth: 1, autoScans: false, teamMembers: 0, recoveryActions: 1 },
  watch: { scansPerMonth: 1, autoScans: true, teamMembers: 0, recoveryActions: 1 },
  pro: { scansPerMonth: Infinity, autoScans: true, teamMembers: 0, recoveryActions: true },
  team: { scansPerMonth: Infinity, autoScans: true, teamMembers: 10, recoveryActions: true },
};

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  free: "Free",
  watch: "Leak Watch",
  pro: "Pro",
  team: "Team",
};

export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  watch: 79,
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
          ? "Free plan allows 1 scan per month. Upgrade to Leak Watch for monthly monitoring or Pro for unlimited scans."
          : plan === "watch"
            ? "Leak Watch includes 1 automated scan per month. Upgrade to Pro for unlimited scans."
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
 * Free users get a limited number of free actions (e.g. 1) to experience value.
 */
export function canUseRecoveryActions(
  plan: PlanType,
  executedCount: number = 0
): {
  allowed: boolean;
  reason?: string;
  remaining?: number;
} {
  const limit = PLAN_LIMITS[plan].recoveryActions;

  if (limit === false) {
    return {
      allowed: false,
      reason:
        "Auto-recovery requires a Pro or Team plan. Upgrade to send dunning emails and auto-fix leaks.",
    };
  }

  if (limit === true) {
    return { allowed: true };
  }

  // Numeric limit (free plan)
  if (executedCount >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reason: `You've used your ${limit} free recovery action${limit !== 1 ? "s" : ""}. Upgrade to Pro for unlimited actions.`,
    };
  }

  return { allowed: true, remaining: limit - executedCount };
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

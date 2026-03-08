import { describe, it, expect } from "vitest";
import {
  canRunScan,
  canEnableAutoScan,
  canInviteTeamMember,
  canUseRecoveryActions,
  PLAN_LIMITS,
} from "../plan-limits";

describe("canRunScan", () => {
  it("allows free plan user with 0 scans", () => {
    expect(canRunScan("free", 0)).toEqual({ allowed: true });
  });

  it("blocks free plan user who already scanned once", () => {
    const result = canRunScan("free", 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Upgrade to Pro");
  });

  it("allows pro plan user with many scans", () => {
    expect(canRunScan("pro", 100)).toEqual({ allowed: true });
  });

  it("allows team plan user with many scans", () => {
    expect(canRunScan("team", 500)).toEqual({ allowed: true });
  });
});

describe("canEnableAutoScan", () => {
  it("blocks free plan", () => {
    const result = canEnableAutoScan("free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Pro or Team");
  });

  it("allows pro plan", () => {
    expect(canEnableAutoScan("pro")).toEqual({ allowed: true });
  });

  it("allows team plan", () => {
    expect(canEnableAutoScan("team")).toEqual({ allowed: true });
  });
});

describe("canInviteTeamMember", () => {
  it("blocks free plan", () => {
    const result = canInviteTeamMember("free", 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Team plan");
  });

  it("blocks pro plan", () => {
    const result = canInviteTeamMember("pro", 0);
    expect(result.allowed).toBe(false);
  });

  it("allows team plan with room", () => {
    expect(canInviteTeamMember("team", 5)).toEqual({ allowed: true });
  });

  it("blocks team plan at limit", () => {
    const result = canInviteTeamMember("team", 10);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("10 members");
  });

  it("blocks team plan over limit", () => {
    const result = canInviteTeamMember("team", 11);
    expect(result.allowed).toBe(false);
  });
});

describe("canUseRecoveryActions", () => {
  it("allows free plan user with 0 executed actions", () => {
    const result = canUseRecoveryActions("free", 0);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("blocks free plan user who used their 1 free action", () => {
    const result = canUseRecoveryActions("free", 1);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toContain("Upgrade to Pro");
  });

  it("blocks free plan user with more than 1 executed action", () => {
    const result = canUseRecoveryActions("free", 5);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows pro plan user with any executed count", () => {
    expect(canUseRecoveryActions("pro", 0)).toEqual({ allowed: true });
    expect(canUseRecoveryActions("pro", 100)).toEqual({ allowed: true });
  });

  it("allows team plan user with any executed count", () => {
    expect(canUseRecoveryActions("team", 0)).toEqual({ allowed: true });
    expect(canUseRecoveryActions("team", 500)).toEqual({ allowed: true });
  });

  it("defaults executedCount to 0 when not provided", () => {
    const result = canUseRecoveryActions("free");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });
});

describe("PLAN_LIMITS", () => {
  it("has correct structure for all plans", () => {
    const plans = ["free", "pro", "team"] as const;
    for (const plan of plans) {
      expect(PLAN_LIMITS[plan]).toHaveProperty("scansPerMonth");
      expect(PLAN_LIMITS[plan]).toHaveProperty("autoScans");
      expect(PLAN_LIMITS[plan]).toHaveProperty("teamMembers");
    }
  });

  it("free plan has strictest limits", () => {
    expect(PLAN_LIMITS.free.scansPerMonth).toBe(1);
    expect(PLAN_LIMITS.free.autoScans).toBe(false);
    expect(PLAN_LIMITS.free.teamMembers).toBe(0);
    expect(PLAN_LIMITS.free.recoveryActions).toBe(1);
  });

  it("pro plan has unlimited scans but no team", () => {
    expect(PLAN_LIMITS.pro.scansPerMonth).toBe(Infinity);
    expect(PLAN_LIMITS.pro.autoScans).toBe(true);
    expect(PLAN_LIMITS.pro.teamMembers).toBe(0);
    expect(PLAN_LIMITS.pro.recoveryActions).toBe(true);
  });

  it("team plan has all features", () => {
    expect(PLAN_LIMITS.team.scansPerMonth).toBe(Infinity);
    expect(PLAN_LIMITS.team.autoScans).toBe(true);
    expect(PLAN_LIMITS.team.teamMembers).toBe(10);
    expect(PLAN_LIMITS.team.recoveryActions).toBe(true);
  });
});

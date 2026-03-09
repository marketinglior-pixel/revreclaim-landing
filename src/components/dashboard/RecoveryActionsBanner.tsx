import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RecoveryActionsBanner({
  userId,
}: {
  userId: string;
}) {
  const supabase = await createClient();

  // Count pending actions
  const { count: pendingCount } = await supabase
    .from("recovery_actions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  // Sum monthly impact of pending actions
  const { data: pendingActions } = await supabase
    .from("recovery_actions")
    .select("monthly_impact")
    .eq("user_id", userId)
    .eq("status", "pending");

  const totalRecoverable = (pendingActions || []).reduce(
    (sum, a) => sum + (a.monthly_impact || 0),
    0
  );

  // Don't show if no pending actions
  if (!pendingCount || pendingCount === 0) return null;

  return (
    <Link
      href="/dashboard/actions"
      className="group block rounded-2xl border border-brand/20 bg-brand/5 p-5 hover:bg-brand/10 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
            <svg
              className="h-5 w-5 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {pendingCount} recovery action{pendingCount === 1 ? "" : "s"}{" "}
              ready to auto-fix
            </p>
            <p className="text-xs text-text-muted">
              Potential recovery:{" "}
              <span className="text-brand font-semibold">
                ${(totalRecoverable / 100).toLocaleString()}/mo
              </span>
              {" "}&middot; Review and fix with one click
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand group-hover:bg-brand/25 transition">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Auto-Fix Now
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

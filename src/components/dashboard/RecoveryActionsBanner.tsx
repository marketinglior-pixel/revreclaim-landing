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
      className="group block rounded-2xl border border-warning/20 bg-warning/5 p-5 hover:bg-warning/10 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
            <svg
              className="h-5 w-5 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {pendingCount} recovery action{pendingCount === 1 ? "" : "s"}{" "}
              waiting for your approval
            </p>
            <p className="text-xs text-text-muted">
              Potential recovery:{" "}
              <span className="text-brand font-semibold">
                ${(totalRecoverable / 100).toLocaleString()}/mo
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-warning group-hover:text-warning/80 transition">
          Review
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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

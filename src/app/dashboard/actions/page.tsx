import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ActionQueue } from "@/components/ActionQueue";

export const metadata = {
  title: "Recovery Actions | RevReclaim",
  description: "Review and approve automated recovery actions for your revenue leaks.",
};

export default async function ActionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan || "free") as "free" | "pro" | "team";

  // Fetch summary stats for the header
  const { count: pendingCount } = await supabase
    .from("recovery_actions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  const { count: executedCount } = await supabase
    .from("recovery_actions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "executed");

  // Sum MRR at risk for pending actions
  const { data: pendingActions } = await supabase
    .from("recovery_actions")
    .select("monthly_impact")
    .eq("user_id", user.id)
    .eq("status", "pending");

  const totalRecoverable = (pendingActions || []).reduce(
    (sum, a) => sum + (a.monthly_impact || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Recovery Actions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Review and approve automated recovery actions. Each action is executed
          only after your approval.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 animate-fade-in-up animate-delay-100">
        {/* Pending */}
        <div className="rounded-xl border-t-2 border-t-warning border border-warning/20 bg-warning/5 backdrop-blur-sm p-5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <svg
              className="h-3.5 w-3.5 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pending
          </div>
          <div className="text-3xl font-bold text-warning">
            {pendingCount || 0}
          </div>
          <p className="mt-1 text-xs text-text-muted">Awaiting your review</p>
        </div>

        {/* Recoverable MRR */}
        <div className="rounded-xl border-t-2 border-t-brand border border-brand/20 bg-brand/5 backdrop-blur-sm p-5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <svg
              className="h-3.5 w-3.5 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Recoverable
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand">
              ${(totalRecoverable / 100).toLocaleString()}
            </span>
            <span className="text-sm text-text-muted">/mo</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            If all pending actions succeed
          </p>
        </div>

        {/* Executed */}
        <div className="col-span-2 md:col-span-1 rounded-xl border-t-2 border-t-info border border-info/20 bg-info/5 backdrop-blur-sm p-5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <svg
              className="h-3.5 w-3.5 text-info"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Executed
          </div>
          <div className="text-3xl font-bold text-info">
            {executedCount || 0}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Actions completed so far
          </p>
        </div>
      </div>

      {/* Action Queue */}
      <div className="animate-fade-in-up animate-delay-200">
        <ActionQueue plan={plan} />
      </div>
    </div>
  );
}

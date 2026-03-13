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

  const plan = (profile?.plan || "free") as "free" | "watch" | "pro" | "team";

  // Fetch privacy mode + action API key status
  const { data: scanConfig } = await supabase
    .from("scan_configs")
    .select("privacy_mode, action_api_key_encrypted")
    .eq("user_id", user.id)
    .single();
  const privacyMode = !!scanConfig?.privacy_mode;
  const hasActionKey = !!scanConfig?.action_api_key_encrypted;

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

  // Sum recovered MRR (executed actions)
  const { data: executedActions } = await supabase
    .from("recovery_actions")
    .select("monthly_impact")
    .eq("user_id", user.id)
    .eq("status", "executed");

  const totalRecovered = (executedActions || []).reduce(
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in-up animate-delay-100">
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
        <div className="rounded-xl border-t-2 border-t-info border border-info/20 bg-info/5 backdrop-blur-sm p-5">
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

        {/* Recovered */}
        <div className="rounded-xl border-t-2 border-t-brand border border-brand/30 bg-gradient-to-br from-brand/10 to-brand/5 backdrop-blur-sm p-5">
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
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
            Recovered
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand">
              ${(totalRecovered / 100).toLocaleString()}
            </span>
            <span className="text-sm text-text-muted">/mo</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Revenue saved so far
          </p>
        </div>
      </div>

      {/* Action Queue */}
      <div className="animate-fade-in-up animate-delay-200">
        <ActionQueue plan={plan} privacyMode={privacyMode} hasActionKey={hasActionKey} />
      </div>
    </div>
  );
}

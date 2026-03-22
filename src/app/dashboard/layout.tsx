import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BreakdownPanel from "@/components/dashboard/BreakdownPanel";
import { ScanReport } from "@/lib/types";

export const metadata = {
  title: "Dashboard | RevReclaim",
  description: "View your revenue leak reports and manage automated scans.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan as string) || "free";

  // Fetch latest report for breakdown panel
  const { data: latestRow } = await supabase
    .from("reports")
    .select("id, created_at, platform, summary, categories, leaks")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const latestReport: ScanReport | null = latestRow
    ? {
        id: latestRow.id as string,
        platform: (latestRow.platform as string) || "stripe",
        scannedAt: latestRow.created_at as string,
        summary: latestRow.summary as unknown as ScanReport["summary"],
        categories: latestRow.categories as unknown as ScanReport["categories"],
        leaks: latestRow.leaks as unknown as ScanReport["leaks"],
      }
    : null;

  // Count pending actions for sidebar badge
  const { count: pendingActions } = await supabase
    .from("recovery_actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-surface-dim flex">
      <DashboardSidebar
        plan={plan}
        email={user.email || ""}
        pendingActions={pendingActions ?? 0}
      />
      <main className="flex-1 min-w-0 px-4 lg:px-8 py-8 overflow-y-auto">
        {children}
      </main>
      <BreakdownPanel report={latestReport} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <DashboardNav
        email={user.email || ""}
        plan={(profile?.plan as string) || "free"}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

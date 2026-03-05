"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  member_email: string;
  role: "admin" | "member";
  invite_status: "pending" | "accepted";
  invited_at: string;
  accepted_at: string | null;
}

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team/members");
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      console.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth and plan
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/dashboard/team");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      const plan = (profile?.plan as string) || "free";
      setUserPlan(plan);

      if (plan !== "team") {
        // Redirect non-team users
        router.push("/dashboard");
        return;
      }

      fetchMembers();
    };

    checkAuth();
  }, [router, fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: data.message });
        setInviteEmail("");
        fetchMembers();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send invite." });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from your team?`)) return;

    try {
      const res = await fetch(`/api/team/members?id=${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setMessage({ type: "success", text: `${email} removed from team.` });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove member." });
    }
  };

  if (userPlan !== "team") {
    return null; // Will redirect
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-sm text-[#999] mt-1">
          Invite team members to view shared revenue leak reports.
        </p>
      </div>

      {/* Invite form */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Invite a team member
        </h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#10B981] transition"
            disabled={inviting}
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/30 disabled:cursor-not-allowed text-black font-bold rounded-lg transition text-sm"
          >
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-[#666] mt-3">
          Team plan supports up to 10 members. Members can view all shared
          reports.
        </p>
      </div>

      {/* Members list */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Team Members
          </h2>
          <span className="text-xs text-[#999]">
            {members.length}/10 seats used
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#666] mt-3">Loading team...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#666]">
              No team members yet. Send your first invite above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2A2A]">
            {members.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#10B981]">
                      {member.member_email[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {member.member_email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#666] capitalize">
                        {member.role}
                      </span>
                      {member.invite_status === "pending" ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-500/10 text-yellow-500 rounded">
                          Pending
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#10B981]/10 text-[#10B981] rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleRemove(member.id, member.member_email)
                  }
                  className="text-xs text-[#666] hover:text-[#EF4444] transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

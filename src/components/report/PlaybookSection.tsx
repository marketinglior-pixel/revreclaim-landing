"use client";

import type { Leak } from "@/lib/types";
import { getRelevantPlaybooks } from "@/lib/recovery/playbooks";
import PlaybookCard from "./PlaybookCard";

interface PlaybookSectionProps {
  leaks: Leak[];
}

export default function PlaybookSection({ leaks }: PlaybookSectionProps) {
  const leakTypes = [...new Set(leaks.map((l) => l.type))];
  const playbooks = getRelevantPlaybooks(leakTypes);

  if (playbooks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Recovery Playbooks</h2>
        <p className="mt-1 text-sm text-text-muted">
          Step-by-step guides to fix the leaks we found, ordered by impact.
        </p>
      </div>

      <div className="space-y-3">
        {playbooks.map((pb) => {
          const matchingCount = leaks.filter((l) =>
            pb.leakTypes.includes(l.type)
          ).length;
          return (
            <PlaybookCard
              key={pb.id}
              playbook={pb}
              matchingLeakCount={matchingCount}
            />
          );
        })}
      </div>
    </div>
  );
}

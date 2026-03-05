export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded-lg bg-[#111] animate-pulse" />
          <div className="h-4 w-24 rounded bg-[#111] animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-[#111] animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
            <div className="h-3 w-20 rounded bg-[#1A1A1A] animate-pulse mb-3" />
            <div className="h-7 w-24 rounded bg-[#1A1A1A] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Reports list skeleton */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
        <div className="border-b border-[#2A2A2A] px-5 py-4">
          <div className="h-5 w-32 rounded bg-[#1A1A1A] animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 rounded bg-[#1A1A1A] animate-pulse" />
              <div className="h-4 w-16 rounded bg-[#1A1A1A] animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-20 rounded bg-[#1A1A1A] animate-pulse" />
              <div className="h-8 w-16 rounded bg-[#1A1A1A] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

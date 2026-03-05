export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header skeleton */}
      <div className="border-b border-[#2A2A2A] bg-[#0A0A0A]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-[#10B981] animate-pulse" />
            <div className="h-5 w-24 rounded bg-[#111] animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 rounded bg-[#111] animate-pulse hidden sm:block" />
            <div className="h-8 w-24 rounded-lg bg-[#111] animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
              <div className="h-3 w-20 rounded bg-[#1A1A1A] animate-pulse mb-3" />
              <div className="h-8 w-28 rounded bg-[#1A1A1A] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6">
          <div className="h-5 w-40 rounded bg-[#1A1A1A] animate-pulse mb-6" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-32 rounded bg-[#1A1A1A] animate-pulse" />
                <div className="flex-1 h-6 rounded bg-[#1A1A1A] animate-pulse" style={{ maxWidth: `${80 - i * 15}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
          <div className="border-b border-[#2A2A2A] px-5 py-4">
            <div className="h-5 w-28 rounded bg-[#1A1A1A] animate-pulse" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-6 w-16 rounded-full bg-[#1A1A1A] animate-pulse" />
                <div className="h-4 w-48 rounded bg-[#1A1A1A] animate-pulse" />
              </div>
              <div className="h-4 w-20 rounded bg-[#1A1A1A] animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

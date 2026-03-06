export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-56 rounded-lg bg-surface animate-pulse" />
          <div className="h-4 w-32 rounded bg-surface animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-surface animate-pulse" />
      </div>

      {/* Hero recovery card skeleton */}
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="h-5 w-40 rounded bg-surface-light animate-pulse" />
            <div className="h-10 w-48 rounded bg-surface-light animate-pulse" />
            <div className="h-4 w-64 rounded bg-surface-light animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-surface-light animate-pulse" />
        </div>
      </div>

      {/* Stats grid skeleton — 4 cards with top border accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5"
            style={{ borderTopWidth: "2px" }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-3.5 w-3.5 rounded bg-surface-light animate-pulse" />
              <div className="h-3 w-20 rounded bg-surface-light animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded bg-surface-light animate-pulse" />
            <div className="h-3 w-16 rounded bg-surface-light animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Reports list skeleton */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <div className="h-5 w-32 rounded bg-surface-light animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 rounded bg-surface-light animate-pulse" />
              <div className="h-4 w-16 rounded bg-surface-light animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-20 rounded bg-surface-light animate-pulse" />
              <div className="h-8 w-16 rounded bg-surface-light animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

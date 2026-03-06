export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header skeleton */}
      <div className="border-b border-border bg-surface-dim/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-brand animate-pulse" />
            <div className="h-5 w-24 rounded bg-surface animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 rounded bg-surface animate-pulse hidden sm:block" />
            <div className="h-8 w-24 rounded-lg bg-surface animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Health score + summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health score circle placeholder */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8">
            <div className="h-32 w-32 rounded-full border-4 border-surface-light bg-surface-light animate-pulse mb-4" />
            <div className="h-5 w-28 rounded bg-surface-light animate-pulse" />
            <div className="h-3 w-20 rounded bg-surface-light animate-pulse mt-2" />
          </div>

          {/* Summary stats */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-5">
                <div className="h-3 w-24 rounded bg-surface-light animate-pulse mb-3" />
                <div className="h-8 w-28 rounded bg-surface-light animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-light animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Category chart skeleton */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="h-5 w-40 rounded bg-surface-light animate-pulse mb-6" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-32 rounded bg-surface-light animate-pulse" />
                <div className="flex-1 h-6 rounded bg-surface-light animate-pulse" style={{ maxWidth: `${80 - i * 15}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Leak cards skeleton */}
        <div>
          <div className="h-6 w-36 rounded bg-surface-light animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface-light animate-pulse" />
                    <div>
                      <div className="h-4 w-36 rounded bg-surface-light animate-pulse" />
                      <div className="h-3 w-20 rounded bg-surface-light animate-pulse mt-1.5" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded-full bg-surface-light animate-pulse" />
                </div>
                <div className="h-3 w-full rounded bg-surface-light animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-surface-light animate-pulse mt-2" />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
                  <div className="h-4 w-24 rounded bg-surface-light animate-pulse" />
                  <div className="h-8 w-20 rounded-lg bg-surface-light animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

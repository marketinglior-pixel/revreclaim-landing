import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center px-6 py-3 border border-border hover:border-brand/30 text-white font-medium rounded-lg transition"
          >
            Go Home
          </Link>
          <Link
            href="/scan"
            className="inline-flex justify-center px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition"
          >
            Run a Free Scan
          </Link>
        </div>
      </div>
    </div>
  );
}

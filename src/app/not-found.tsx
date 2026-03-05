import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981] mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-[#999] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center px-6 py-3 border border-[#2A2A2A] hover:border-[#10B981]/30 text-white font-medium rounded-lg transition"
          >
            Go Home
          </Link>
          <Link
            href="/scan"
            className="inline-flex justify-center px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
          >
            Run a Free Scan
          </Link>
        </div>
      </div>
    </div>
  );
}

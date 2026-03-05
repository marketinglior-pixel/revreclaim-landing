import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1A1A1A] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#10B981]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">RevReclaim</span>
        </div>
        <div className="flex gap-6 text-xs text-[#666]">
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
        </div>
        <div className="text-xs text-[#666]">
          &copy; {new Date().getFullYear()} RevReclaim. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

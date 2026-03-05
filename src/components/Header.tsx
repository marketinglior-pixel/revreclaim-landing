export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">RevReclaim</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-[#999] transition-colors hover:text-white">How it works</a>
          <a href="#pricing" className="text-sm text-[#999] transition-colors hover:text-white">Pricing</a>
          <a href="#faq" className="text-sm text-[#999] transition-colors hover:text-white">FAQ</a>
        </nav>
        <a
          href="/scan"
          className="rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          Scan Now — Free
        </a>
      </div>
    </header>
  );
}

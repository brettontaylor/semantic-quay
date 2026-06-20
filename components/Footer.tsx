import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line-bright bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 text-paper">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-lg font-medium tracking-tight">
                Semantic Quay
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              An engineering and advisory practice modernizing banking data
              infrastructure with AI.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="eyebrow mb-3">Explore</p>
              <ul className="space-y-2 text-sm text-paper/70">
                <li><a href="/#approach" className="hover:text-paper">Approach</a></li>
                <li><a href="/developers" className="hover:text-paper">Developers</a></li>
                <li><a href="/#contact" className="hover:text-paper">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 quay-rule opacity-30" />
        <p className="mt-6 font-mono text-xs text-paper/45">
          © {new Date().getFullYear()} Semantic Quay, Inc.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";

/**
 * Semantic Quay mark: a small node–edge graph "docked" along a quay line.
 * Uses currentColor for strokes so it inherits ink/paper from context;
 * node fills use the teal accent. Anonymous, infrastructure-grade.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* quay line (the waterfront edge) */}
      <line
        x1="4"
        y1="30"
        x2="36"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* mooring posts */}
      <line x1="10" y1="30" x2="10" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="20" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="30" x2="30" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* graph edges */}
      <path
        d="M10 23 L20 9 L30 19 M20 9 L20 30 M10 23 L30 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* nodes */}
      <circle cx="20" cy="9" r="3" fill="var(--color-accent)" />
      <circle cx="10" cy="23" r="2.5" fill="var(--color-accent)" />
      <circle cx="30" cy="19" r="2.5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const color = tone === "paper" ? "text-paper" : "text-ink";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${color}`}
      aria-label="Semantic Quay — home"
    >
      <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="font-display text-lg font-medium tracking-tight">
        Semantic Quay
      </span>
    </Link>
  );
}

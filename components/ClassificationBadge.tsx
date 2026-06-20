import type { Classification } from "@/app/developers/_reference";

const styles: Record<Classification, string> = {
  public: "bg-accent/10 text-accent border-accent/25",
  internal: "bg-ink/[0.06] text-ink/70 border-line",
  confidential: "bg-brass/15 text-brass border-brass/30",
  restricted: "bg-red-500/10 text-red-700 border-red-500/25",
};

export function ClassificationBadge({ level }: { level: Classification }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider ${styles[level]}`}
    >
      {level}
    </span>
  );
}

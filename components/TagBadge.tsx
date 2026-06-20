// PII / MNPI handling tags (orthogonal to the sensitivity tier).
const styles = {
  pii: "bg-violet-500/12 text-violet-700 border-violet-500/30",
  mnpi: "bg-amber-500/15 text-amber-700 border-amber-500/30",
} as const;

export function TagBadge({ tag }: { tag: "pii" | "mnpi" }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider ${styles[tag]}`}
      title={tag === "pii" ? "Personally identifiable information" : "Material non-public information"}
    >
      {tag}
    </span>
  );
}

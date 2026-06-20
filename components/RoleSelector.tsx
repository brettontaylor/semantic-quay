"use client";

import type { Role } from "@/app/developers/_reference";

export function RoleSelector({
  roles,
  value,
  onChange,
}: {
  roles: Role[];
  value: string;
  onChange: (role: string) => void;
}) {
  const active = roles.find((r) => r.role === value);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {roles.map((r) => {
          const on = r.role === value;
          return (
            <button
              key={r.role}
              onClick={() => onChange(r.role)}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                on
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-muted hover:border-accent/40 hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      {active && (
        <p className="mt-3 text-sm text-muted">
          <span className="text-ink">{active.label}</span> — clearance up to{" "}
          <span className="font-mono text-ink">{active.maxTier}</span> · PII{" "}
          <Mark on={active.pii} /> · MNPI <Mark on={active.mnpi} />
          {active.description ? ` — ${active.description}` : ""}
        </p>
      )}
    </div>
  );
}

function Mark({ on }: { on: boolean }) {
  return (
    <span className={on ? "text-accent" : "text-red-600"}>{on ? "✓" : "✗"}</span>
  );
}

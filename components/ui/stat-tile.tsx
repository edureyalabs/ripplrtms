import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  tone = "neutral",
  hint,
  size = "md",
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "progress" | "submitted" | "completed" | "danger";
  hint?: string;
  size?: "sm" | "md";
}) {
  const valueTone: Record<string, string> = {
    neutral: "text-zinc-900 dark:text-zinc-50",
    progress: "text-blue-600 dark:text-blue-400",
    submitted: "text-amber-600 dark:text-amber-400",
    completed: "text-emerald-600 dark:text-emerald-400",
    danger: "text-red-600 dark:text-red-400",
  };

  if (size === "sm") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-0 px-3 py-2.5 shadow-[var(--shadow-card)] dark:border-surface-border-dark dark:bg-surface-0-dark">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className={`mt-0.5 text-lg font-semibold tabular-nums leading-none ${valueTone[tone]}`}>
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-4 shadow-[var(--shadow-card)] dark:border-surface-border-dark dark:bg-surface-0-dark">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueTone[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">{hint}</p>}
    </div>
  );
}

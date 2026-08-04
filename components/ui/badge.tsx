import type { ReactNode } from "react";

const TONES = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  brand: "bg-brand-900/10 text-brand-900 dark:bg-teal-400/10 dark:text-teal-400",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

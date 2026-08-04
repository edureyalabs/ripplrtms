export function ProgressBar({
  value,
  total,
  tone = "accent",
}: {
  value: number;
  total: number;
  tone?: "accent" | "success";
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const barTone = tone === "success" ? "bg-emerald-500" : "bg-accent-600 dark:bg-accent-500";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={`h-full rounded-full transition-[width] ${barTone}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

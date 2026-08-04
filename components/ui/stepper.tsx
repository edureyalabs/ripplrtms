type Phase = { id: string; name: string; status: "pending" | "submitted" | "accepted" };

const SEGMENT_TONE: Record<Phase["status"], string> = {
  pending: "bg-zinc-200 dark:bg-zinc-700",
  submitted: "bg-amber-400 dark:bg-amber-500",
  accepted: "bg-emerald-500 dark:bg-emerald-500",
};

const DOT_TONE: Record<Phase["status"], string> = {
  pending: "bg-zinc-300 dark:bg-zinc-600",
  submitted: "bg-amber-500",
  accepted: "bg-emerald-500",
};

export function Stepper({ phases }: { phases: Phase[] }) {
  if (phases.length === 0) return null;

  const accepted = phases.filter((p) => p.status === "accepted").length;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Phases</span>
        <span>
          {accepted} of {phases.length} complete
        </span>
      </div>
      <div className="mt-2 flex gap-1">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`h-1.5 flex-1 rounded-full ${SEGMENT_TONE[phase.status]}`}
            title={`${phase.name}: ${phase.status}`}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {phases.map((phase) => (
          <li key={phase.id} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONE[phase.status]}`} />
            {phase.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type TimelineEntry = {
  id: string;
  kind: "status_change" | "phase_submitted" | "phase_accepted" | "phase_rejected" | "manual_update";
  actorName: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  phaseName?: string | null;
  reason?: string | null;
  body?: string | null;
  attachments?: { id: string; fileName: string; url: string }[];
  createdAt: string;
};

function describe(entry: TimelineEntry) {
  switch (entry.kind) {
    case "status_change":
      return `${entry.actorName} moved status to ${entry.toStatus?.replace("_", " ")}`;
    case "phase_submitted":
      return `${entry.actorName} submitted phase "${entry.phaseName}" for review`;
    case "phase_accepted":
      return `${entry.actorName} accepted phase "${entry.phaseName}"`;
    case "phase_rejected":
      return `${entry.actorName} rejected phase "${entry.phaseName}"`;
    case "manual_update":
      return `${entry.actorName} posted an update`;
  }
}

const DOT_TONE: Record<TimelineEntry["kind"], string> = {
  status_change: "bg-accent-600 dark:bg-accent-500",
  phase_submitted: "bg-amber-500",
  phase_accepted: "bg-emerald-500",
  phase_rejected: "bg-red-500",
  manual_update: "bg-zinc-400 dark:bg-zinc-500",
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_TONE[entry.kind]}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{describe(entry)}</p>
            {entry.body && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                {entry.body}
              </p>
            )}
            {entry.reason && (
              <p className="mt-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
                {entry.reason}
              </p>
            )}
            {entry.attachments && entry.attachments.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {entry.attachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-surface-border bg-surface-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-surface-100 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-300"
                    >
                      {att.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

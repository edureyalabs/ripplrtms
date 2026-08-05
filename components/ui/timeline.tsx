export type TimelineEntry = {
  id: string;
  kind:
    | "task_created"
    | "status_change"
    | "phase_submitted"
    | "phase_accepted"
    | "phase_rejected"
    | "manual_update";
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
    case "task_created":
      return `${entry.actorName} created this task`;
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
  task_created: "bg-zinc-500 dark:bg-zinc-400",
  status_change: "bg-accent-600 dark:bg-accent-500",
  phase_submitted: "bg-amber-500",
  phase_accepted: "bg-emerald-500",
  phase_rejected: "bg-red-500",
  manual_update: "bg-zinc-400 dark:bg-zinc-500",
};

function EntryIcon({ kind }: { kind: TimelineEntry["kind"] }) {
  const common = "h-3 w-3 text-white";
  switch (kind) {
    case "task_created":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H3a1 1 0 1 1 0-2h6V3a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "status_change":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M10 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L9 12.586V4a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "phase_accepted":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
        </svg>
      );
    case "phase_rejected":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M6.7 5.3a1 1 0 0 0-1.4 1.4L8.6 10l-3.3 3.3a1 1 0 1 0 1.4 1.4L10 11.4l3.3 3.3a1 1 0 0 0 1.4-1.4L11.4 10l3.3-3.3a1 1 0 0 0-1.4-1.4L10 8.6 6.7 5.3Z" />
        </svg>
      );
    case "phase_submitted":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v6.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L9 9.586V3a1 1 0 0 1 1-1ZM4 14a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "manual_update":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={common} aria-hidden="true">
          <path d="M4 4a2 2 0 0 1 2-2h6l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm7 0v3a1 1 0 0 0 1 1h3l-4-4Z" />
        </svg>
      );
  }
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Status changes, phase decisions, and updates will show up here.
        </p>
      </div>
    );
  }

  const chronological = [...entries].reverse();

  return (
    <ol className="relative flex flex-col gap-6">
      {chronological.length > 1 && (
        <span
          className="absolute left-[11px] top-3 bottom-3 w-px bg-surface-border dark:bg-surface-border-dark"
          aria-hidden="true"
        />
      )}
      {chronological.map((entry) => (
        <li key={entry.id} className="relative flex gap-3">
          <span
            className={`z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ring-4 ring-background ${DOT_TONE[entry.kind]}`}
          >
            <EntryIcon kind={entry.kind} />
          </span>
          <div className="min-w-0 flex-1 pb-0.5">
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{describe(entry)}</p>
            {entry.body && (
              <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-surface-50 px-3 py-2 text-sm text-zinc-700 dark:bg-surface-50-dark dark:text-zinc-300">
                {entry.body}
              </p>
            )}
            {entry.reason && (
              <p className="mt-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
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
              {new Date(entry.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

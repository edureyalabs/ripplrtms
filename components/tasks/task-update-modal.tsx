"use client";

import { submitTaskUpdate } from "@/lib/actions/task-progress";
import { Checkbox } from "@/components/ui/form-field";
import { LogEntryModal } from "@/components/tasks/log-entry-modal";

type PendingPhase = { id: string; name: string };

export function TaskUpdateModal({
  taskId,
  pendingPhases,
  willStartTask,
}: {
  taskId: string;
  pendingPhases: PendingPhase[];
  /** True when the task is still "open" — posting will auto-move it to In Progress. */
  willStartTask: boolean;
}) {
  return (
    <LogEntryModal
      taskId={taskId}
      action={submitTaskUpdate}
      triggerLabel="Post Update"
      triggerIcon={<UpdateIcon />}
      triggerClassName="flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
      modalTitle="Post an update"
      bodyPlaceholder="What did you do? What's next?"
      submitLabel="Post update"
      note={
        willStartTask ? (
          <p className="mt-2 rounded-md bg-accent-50 px-3 py-2 text-xs text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
            This is the first update — the task will move to <strong>In Progress</strong>.
          </p>
        ) : undefined
      }
      extra={
        pendingPhases.length > 0 ? (
          <div className="rounded-md border border-surface-border p-3 dark:border-surface-border-dark">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Mark phases complete with this update
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {pendingPhases.map((phase) => (
                <Checkbox key={phase.id} name="phase_ids" value={phase.id} label={phase.name} />
              ))}
            </div>
          </div>
        ) : undefined
      }
    />
  );
}

function UpdateIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10 2a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H3a1 1 0 1 1 0-2h6V3a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

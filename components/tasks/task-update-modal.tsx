"use client";

import { useActionState, useState } from "react";
import { submitTaskUpdate, type TaskUpdateState } from "@/lib/actions/task-progress";
import { SubmitButton } from "@/components/submit-button";
import { Textarea, Checkbox } from "@/components/ui/form-field";

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
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TaskUpdateState, FormData>(submitTaskUpdate, undefined);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success && open) {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
      >
        <UpdateIcon />
        Post Update
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-6 shadow-[var(--shadow-popover)] dark:border-surface-border-dark dark:bg-surface-0-dark">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Post an update</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {willStartTask && (
              <p className="mt-2 rounded-md bg-accent-50 px-3 py-2 text-xs text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
                This is the first update — the task will move to <strong>In Progress</strong>.
              </p>
            )}

            <form action={formAction} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="task_id" value={taskId} />

              <Textarea
                name="body"
                placeholder="What did you do? What's next?"
                rows={4}
                required
                autoFocus
              />

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Attachment
                </label>
                <input
                  type="file"
                  name="attachment"
                  accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx"
                  className="mt-1.5 block w-full text-xs text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200"
                />
              </div>

              {pendingPhases.length > 0 && (
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
              )}

              {state?.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-600 hover:bg-surface-50 dark:text-zinc-400 dark:hover:bg-surface-50-dark"
                >
                  Cancel
                </button>
                <SubmitButton
                  pendingLabel="Posting..."
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
                >
                  Post update
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function UpdateIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10 2a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H3a1 1 0 1 1 0-2h6V3a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

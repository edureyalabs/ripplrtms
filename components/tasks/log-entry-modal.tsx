"use client";

import { useActionState, useState, type ReactNode } from "react";
import type { TaskUpdateState } from "@/lib/actions/task-progress";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/form-field";

const MAX_BODY_LENGTH = 1000;

export function LogEntryModal({
  taskId,
  action,
  triggerLabel,
  triggerIcon,
  triggerClassName,
  modalTitle,
  bodyPlaceholder,
  note,
  extra,
  submitLabel,
}: {
  taskId: string;
  action: (prevState: TaskUpdateState, formData: FormData) => Promise<TaskUpdateState>;
  triggerLabel: string;
  triggerIcon: ReactNode;
  triggerClassName: string;
  modalTitle: string;
  bodyPlaceholder: string;
  note?: ReactNode;
  extra?: ReactNode;
  submitLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TaskUpdateState, FormData>(action, undefined);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success && open) {
      setOpen(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerIcon}
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-6 shadow-[var(--shadow-popover)] dark:border-surface-border-dark dark:bg-surface-0-dark">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{modalTitle}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {note}

            <form action={formAction} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="task_id" value={taskId} />

              <Textarea
                name="body"
                placeholder={bodyPlaceholder}
                rows={4}
                required
                maxLength={MAX_BODY_LENGTH}
                autoFocus
              />

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Attachments
                </label>
                <input
                  type="file"
                  name="attachment"
                  multiple
                  accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx"
                  className="mt-1.5 block w-full text-xs text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200"
                />
                <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-600">
                  Up to 5 files, 5MB each. Images, PDF, Word, or Excel.
                </p>
              </div>

              {extra}

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
                  {submitLabel}
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

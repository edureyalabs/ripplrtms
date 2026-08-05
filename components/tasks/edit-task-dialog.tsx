"use client";

import { useActionState, useState } from "react";
import { updateTaskDetails, type TaskState } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";
import { FormField, TextInput, Textarea } from "@/components/ui/form-field";

export function EditTaskDialog({
  taskId,
  name,
  description,
  startDate,
  endDate,
}: {
  taskId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TaskState, FormData>(updateTaskDetails, undefined);

  // Close the dialog once a submit succeeds, without a useEffect: compare
  // against the last state we've reacted to and adjust during render.
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
        className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-surface-border px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-50 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
      >
        <PencilIcon />
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-6 shadow-[var(--shadow-popover)] dark:border-surface-border-dark dark:bg-surface-0-dark">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit task</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="id" value={taskId} />

              <FormField label="Task name" htmlFor="edit-name">
                <TextInput id="edit-name" name="name" defaultValue={name} required maxLength={400} />
              </FormField>

              <FormField label="Description" htmlFor="edit-description">
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={description ?? ""}
                  rows={3}
                  maxLength={1000}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start date" htmlFor="edit-start_date">
                  <TextInput
                    id="edit-start_date"
                    name="start_date"
                    type="date"
                    defaultValue={startDate}
                    required
                  />
                </FormField>
                <FormField label="Deadline" htmlFor="edit-end_date">
                  <TextInput
                    id="edit-end_date"
                    name="end_date"
                    type="date"
                    defaultValue={endDate}
                    required
                  />
                </FormField>
              </div>

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
                  pendingLabel="Saving..."
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
                >
                  Save changes
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M14.69 2.86a1.5 1.5 0 0 1 2.12 0l.33.33a1.5 1.5 0 0 1 0 2.12l-9.2 9.2-3.1.78.78-3.1 9.07-9.33Z" />
    </svg>
  );
}

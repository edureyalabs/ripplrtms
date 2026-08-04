"use client";

import { useActionState, useState } from "react";
import { updateTaskStatus, rejectTaskSubmission, type TaskState } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/form-field";
import type { Enums } from "@/lib/types/database";

export function TaskStatusButton({
  taskId,
  targetStatus,
  label,
  pendingLabel,
  variant = "primary",
}: {
  taskId: string;
  targetStatus: Enums<"task_status">;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "outline" | "danger";
}) {
  const [state, formAction] = useActionState<TaskState, FormData>(updateTaskStatus, undefined);

  const classes = {
    primary:
      "flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600",
    outline:
      "flex h-9 items-center justify-center gap-2 rounded-md border border-surface-border px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark",
    danger:
      "flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40",
  } as const;

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={taskId} />
      <input type="hidden" name="status" value={targetStatus} />
      <SubmitButton pendingLabel={pendingLabel} className={classes[variant]}>
        {label}
      </SubmitButton>
      {state?.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function TaskRejectControl({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TaskState, FormData>(
    rejectTaskSubmission,
    undefined
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Reject
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-2">
      <input type="hidden" name="id" value={taskId} />
      <Textarea
        name="reason"
        placeholder="Why is this being sent back?"
        rows={2}
        required
      />
      <div className="flex gap-2">
        <SubmitButton
          pendingLabel="Rejecting..."
          className="flex h-9 items-center justify-center rounded-md border border-red-200 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Confirm reject
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancel
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

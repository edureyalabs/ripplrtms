"use client";

import { useActionState } from "react";
import { postTaskUpdate, postProjectUpdate, type UpdateState } from "@/lib/actions/updates";
import { Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

export function UpdateForm({
  parentType,
  parentId,
}: {
  parentType: "task" | "project";
  parentId: string;
}) {
  const action = parentType === "task" ? postTaskUpdate : postProjectUpdate;
  const [state, formAction] = useActionState<UpdateState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-surface-border p-3 dark:border-surface-border-dark">
      <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
      <Textarea name="body" placeholder="Post an update..." rows={3} required />
      <div className="flex items-center justify-between gap-3">
        <input
          type="file"
          name="attachment"
          accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx"
          className="text-xs text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200"
        />
        <SubmitButton
          pendingLabel="Posting..."
          className="flex h-8 shrink-0 items-center justify-center rounded-md bg-accent-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          Post update
        </SubmitButton>
      </div>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

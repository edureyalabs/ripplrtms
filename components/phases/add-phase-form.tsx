"use client";

import { useActionState } from "react";
import { addTaskPhase, addProjectPhase, type PhaseState } from "@/lib/actions/phases";
import { TextInput } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

export function AddPhaseForm({
  parentType,
  parentId,
}: {
  parentType: "task" | "project";
  parentId: string;
}) {
  const action = parentType === "task" ? addTaskPhase : addProjectPhase;
  const [state, formAction] = useActionState<PhaseState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
      <TextInput name="name" placeholder="New phase name" required className="!py-1.5 text-sm" />
      <SubmitButton
        pendingLabel="Adding..."
        className="flex h-8 shrink-0 items-center justify-center rounded-md border border-surface-border px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
      >
        Add
      </SubmitButton>
      {state?.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

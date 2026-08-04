"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";
import { submitTaskPhases, submitProjectPhases, type PhaseState } from "@/lib/actions/phases";

type PendingPhase = { id: string; name: string };

export function SubmitPhasesForm({
  parentType,
  parentId,
  pendingPhases,
}: {
  parentType: "task" | "project";
  parentId: string;
  pendingPhases: PendingPhase[];
}) {
  const action = parentType === "task" ? submitTaskPhases : submitProjectPhases;
  const [state, formAction] = useActionState<PhaseState, FormData>(action, undefined);

  if (pendingPhases.length === 0) return null;

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2 rounded-md border border-surface-border p-3 dark:border-surface-border-dark">
      <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Submit phases for review
      </p>
      {pendingPhases.map((phase) => (
        <Checkbox key={phase.id} name="phase_ids" value={phase.id} label={phase.name} />
      ))}
      <SubmitButton
        pendingLabel="Submitting..."
        className="mt-1 flex h-8 w-fit items-center justify-center rounded-md bg-accent-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
      >
        Submit selected
      </SubmitButton>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

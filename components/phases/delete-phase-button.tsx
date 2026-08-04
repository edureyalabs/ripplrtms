"use client";

import { useActionState } from "react";
import { deleteTaskPhase, deleteProjectPhase, type PhaseState } from "@/lib/actions/phases";
import { SubmitButton } from "@/components/submit-button";

export function DeletePhaseButton({
  parentType,
  parentId,
  phaseId,
}: {
  parentType: "task" | "project";
  parentId: string;
  phaseId: string;
}) {
  const action = parentType === "task" ? deleteTaskPhase : deleteProjectPhase;
  const [state, formAction] = useActionState<PhaseState, FormData>(action, undefined);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="phase_id" value={phaseId} />
      <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
      <SubmitButton
        pendingLabel="..."
        className="text-xs font-medium text-zinc-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70 dark:text-zinc-600 dark:hover:text-red-400"
      >
        Delete
      </SubmitButton>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

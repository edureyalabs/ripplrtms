"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/form-field";
import {
  acceptTaskPhase,
  rejectTaskPhase,
  acceptProjectPhase,
  rejectProjectPhase,
  type PhaseState,
} from "@/lib/actions/phases";

export function PhaseDecision({
  parentType,
  parentId,
  phaseId,
  phaseName,
}: {
  parentType: "task" | "project";
  parentId: string;
  phaseId: string;
  phaseName: string;
}) {
  const acceptAction = parentType === "task" ? acceptTaskPhase : acceptProjectPhase;
  const rejectAction = parentType === "task" ? rejectTaskPhase : rejectProjectPhase;
  const idField = parentType === "task" ? "task_id" : "project_id";

  const [rejecting, setRejecting] = useState(false);
  const [acceptState, acceptFormAction] = useActionState<PhaseState, FormData>(
    acceptAction,
    undefined
  );
  const [rejectState, rejectFormAction] = useActionState<PhaseState, FormData>(
    rejectAction,
    undefined
  );

  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        <span className="font-medium">{phaseName}</span> awaiting your decision
      </p>
      {!rejecting ? (
        <div className="flex items-center gap-2">
          <form action={acceptFormAction}>
            <input type="hidden" name="phase_id" value={phaseId} />
            <input type="hidden" name={idField} value={parentId} />
            <SubmitButton
              pendingLabel="Accepting..."
              className="flex h-8 items-center justify-center rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Accept
            </SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="flex h-8 items-center justify-center rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Reject
          </button>
        </div>
      ) : (
        <form action={rejectFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="phase_id" value={phaseId} />
          <input type="hidden" name={idField} value={parentId} />
          <Textarea name="reason" placeholder="Why is this being sent back?" rows={2} required />
          <div className="flex gap-2">
            <SubmitButton
              pendingLabel="Rejecting..."
              className="flex h-8 items-center justify-center rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Confirm reject
            </SubmitButton>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {(acceptState?.error || rejectState?.error) && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {acceptState?.error || rejectState?.error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { addProjectMember, removeProjectMember, type ProjectState } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/submit-button";
import { Select } from "@/components/ui/form-field";

export function AddMemberForm({
  projectId,
  candidates,
}: {
  projectId: string;
  candidates: { id: string; full_name: string; email: string }[];
}) {
  const [state, formAction] = useActionState<ProjectState, FormData>(
    addProjectMember,
    undefined
  );

  if (candidates.length === 0) return null;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="project_id" value={projectId} />
      <Select name="user_id" required defaultValue="" className="!py-1.5 text-sm">
        <option value="" disabled>
          Add a member
        </option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name || c.email}
          </option>
        ))}
      </Select>
      <SubmitButton
        pendingLabel="Adding..."
        className="flex h-9 shrink-0 items-center justify-center rounded-md border border-surface-border px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
      >
        Add
      </SubmitButton>
      {state?.error && (
        <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>
      )}
    </form>
  );
}

export function RemoveMemberButton({ projectId, userId }: { projectId: string; userId: string }) {
  const [state, formAction] = useActionState<ProjectState, FormData>(
    removeProjectMember,
    undefined
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="user_id" value={userId} />
      <SubmitButton
        pendingLabel="Removing..."
        className="text-xs font-medium text-zinc-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70 dark:text-zinc-600 dark:hover:text-red-400"
      >
        Remove
      </SubmitButton>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}

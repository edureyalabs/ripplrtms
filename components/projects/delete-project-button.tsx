"use client";

import { useActionState } from "react";
import { deleteProject, type ProjectState } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/submit-button";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState<ProjectState, FormData>(deleteProject, undefined);

  return (
    <form action={formAction} className="inline-flex flex-col items-end">
      <input type="hidden" name="id" value={projectId} />
      <SubmitButton
        pendingLabel="Deleting..."
        className="flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete Project
      </SubmitButton>
      {state?.error && (
        <p className="mt-1 max-w-[16rem] text-right text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}

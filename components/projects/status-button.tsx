"use client";

import { useActionState } from "react";
import { updateProjectStatus, type ProjectState } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/submit-button";
import type { Enums } from "@/lib/types/database";

export function ProjectStatusButton({
  projectId,
  targetStatus,
  label,
  pendingLabel,
  variant = "primary",
}: {
  projectId: string;
  targetStatus: Enums<"project_status">;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "outline";
}) {
  const [state, formAction] = useActionState<ProjectState, FormData>(
    updateProjectStatus,
    undefined
  );

  const className =
    variant === "primary"
      ? "flex h-9 items-center justify-center gap-2 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
      : "flex h-9 items-center justify-center gap-2 rounded-md border border-surface-border px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark";

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={projectId} />
      <input type="hidden" name="status" value={targetStatus} />
      <SubmitButton pendingLabel={pendingLabel} className={className}>
        {label}
      </SubmitButton>
      {state?.error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}

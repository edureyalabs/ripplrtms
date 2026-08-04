"use client";

import { useActionState } from "react";
import { deleteDepartment, type DepartmentState } from "@/lib/actions/departments";
import { SubmitButton } from "@/components/submit-button";

export function DeleteDepartmentButton({ id }: { id: string }) {
  const [state, formAction] = useActionState<DepartmentState, FormData>(
    deleteDepartment,
    undefined
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-end">
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        pendingLabel="Deleting..."
        className="text-sm font-medium text-zinc-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70 dark:text-zinc-600 dark:hover:text-red-400"
      >
        Delete
      </SubmitButton>
      {state?.error && (
        <p className="mt-1 max-w-[16rem] text-right text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}

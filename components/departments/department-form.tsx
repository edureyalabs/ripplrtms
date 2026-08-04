"use client";

import { useActionState } from "react";
import { createDepartment, updateDepartment, type DepartmentState } from "@/lib/actions/departments";
import { FormField, TextInput } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

type Department = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export function DepartmentForm({ department }: { department?: Department }) {
  const action = department ? updateDepartment : createDepartment;
  const [state, formAction] = useActionState<DepartmentState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-8 flex max-w-lg flex-col gap-4">
      {department && <input type="hidden" name="id" value={department.id} />}

      <FormField label="Name" htmlFor="name">
        <TextInput id="name" name="name" required defaultValue={department?.name} />
      </FormField>

      <FormField label="Description" htmlFor="description" hint="Optional.">
        <TextInput id="description" name="description" defaultValue={department?.description ?? ""} />
      </FormField>

      {department && (
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="is_active" defaultChecked={department.is_active} />
          Active
        </label>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton
        pendingLabel={department ? "Saving..." : "Creating..."}
        className="mt-2 flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-accent-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:text-white dark:hover:bg-accent-600"
      >
        {department ? "Save changes" : "Create department"}
      </SubmitButton>
    </form>
  );
}

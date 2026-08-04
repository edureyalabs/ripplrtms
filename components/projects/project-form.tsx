"use client";

import { useActionState } from "react";
import { createProject, type ProjectState } from "@/lib/actions/projects";
import { FormField, Select, TextInput, Textarea, Checkbox } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

type Employee = { id: string; full_name: string; email: string };

export function ProjectForm({ employees }: { employees: Employee[] }) {
  const [state, formAction] = useActionState<ProjectState, FormData>(createProject, undefined);

  return (
    <form action={formAction} className="mt-8 flex max-w-2xl flex-col gap-4">
      <FormField label="Project name" htmlFor="name">
        <TextInput id="name" name="name" required />
      </FormField>

      <FormField label="Description" htmlFor="description" hint="Optional.">
        <Textarea id="description" name="description" rows={3} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="start_date">
          <TextInput id="start_date" name="start_date" type="date" required />
        </FormField>
        <FormField label="Deadline" htmlFor="deadline">
          <TextInput id="deadline" name="deadline" type="date" required />
        </FormField>
      </div>

      <FormField label="Project lead" htmlFor="lead_id">
        <Select id="lead_id" name="lead_id" required defaultValue="">
          <option value="" disabled>
            Select a lead
          </option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name || emp.email}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Members"
        htmlFor="member_ids"
        hint="The lead is added automatically. Membership is not limited to one department."
      >
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
          {employees.map((emp) => (
            <Checkbox
              key={emp.id}
              name="member_ids"
              value={emp.id}
              label={emp.full_name || emp.email}
            />
          ))}
        </div>
      </FormField>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton
        pendingLabel="Creating..."
        className="mt-2 flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-accent-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
      >
        Create project
      </SubmitButton>
    </form>
  );
}

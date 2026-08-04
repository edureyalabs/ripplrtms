"use client";

import { useActionState } from "react";
import { createTask, type TaskState } from "@/lib/actions/tasks";
import { FormField, TextInput, Textarea, Checkbox } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

type Candidate = { id: string; full_name: string; email: string };

export function TaskForm({
  projectId,
  candidates,
  minDate,
  maxDate,
  fixedAssignee,
}: {
  projectId?: string;
  candidates: Candidate[];
  minDate?: string;
  maxDate?: string;
  /** When set (e.g. a Team Member creating their own task), skip the picker and self-assign. */
  fixedAssignee?: Candidate;
}) {
  const [state, formAction] = useActionState<TaskState, FormData>(createTask, undefined);

  return (
    <form action={formAction} className="mt-8 flex max-w-2xl flex-col gap-4">
      {projectId && <input type="hidden" name="project_id" value={projectId} />}
      {fixedAssignee && (
        <input type="hidden" name="assignee_ids" value={fixedAssignee.id} />
      )}

      <FormField label="Task name" htmlFor="name">
        <TextInput id="name" name="name" required />
      </FormField>

      <FormField label="Goal" htmlFor="description" hint="What does done look like?">
        <Textarea id="description" name="description" rows={3} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="start_date">
          <TextInput
            id="start_date"
            name="start_date"
            type="date"
            required
            min={minDate}
            max={maxDate}
          />
        </FormField>
        <FormField label="Deadline" htmlFor="end_date">
          <TextInput
            id="end_date"
            name="end_date"
            type="date"
            required
            min={minDate}
            max={maxDate}
          />
        </FormField>
      </div>

      {fixedAssignee ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Assigned to you ({fixedAssignee.full_name || fixedAssignee.email}).
        </p>
      ) : (
        <FormField label="Assignees" htmlFor="assignee_ids" hint="At least one required.">
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
            {candidates.map((c) => (
              <Checkbox
                key={c.id}
                name="assignee_ids"
                value={c.id}
                label={c.full_name || c.email}
              />
            ))}
          </div>
        </FormField>
      )}

      {!fixedAssignee && candidates.length > 0 && (
        <FormField
          label="Collaborators"
          htmlFor="collaborator_ids"
          hint="Optional. Can view and chat, but can't change status."
        >
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
            {candidates.map((c) => (
              <Checkbox
                key={c.id}
                name="collaborator_ids"
                value={c.id}
                label={c.full_name || c.email}
              />
            ))}
          </div>
        </FormField>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton
        pendingLabel="Creating..."
        className="mt-2 flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-accent-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
      >
        Create task
      </SubmitButton>
    </form>
  );
}

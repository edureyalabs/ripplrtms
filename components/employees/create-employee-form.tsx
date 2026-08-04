"use client";

import { useActionState } from "react";
import { createEmployee, type EmployeeState } from "@/lib/actions/employees";
import { FormField, TextInput } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

export function CreateEmployeeForm() {
  const [state, formAction] = useActionState<EmployeeState, FormData>(createEmployee, undefined);

  return (
    <form action={formAction} className="mt-8 flex max-w-lg flex-col gap-4">
      <FormField label="Full name" htmlFor="full_name">
        <TextInput id="full_name" name="full_name" required />
      </FormField>

      <FormField label="Work email" htmlFor="email">
        <TextInput id="email" name="email" type="email" required placeholder="name@ripplr.com" />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        hint="At least 8 characters. The account is created already verified."
      >
        <TextInput id="password" name="password" type="password" required minLength={8} />
      </FormField>

      <FormField label="Avatar" htmlFor="avatar" hint="Optional. PNG, JPEG, or WebP, up to 5MB.">
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200"
        />
      </FormField>

      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Role and department are tagged next, once the login exists.
      </p>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton
        pendingLabel="Creating..."
        className="mt-2 flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-brand-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
      >
        Create login
      </SubmitButton>
    </form>
  );
}

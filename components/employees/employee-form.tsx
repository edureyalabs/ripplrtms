"use client";

import { useActionState } from "react";
import { createEmployee, updateEmployee, type EmployeeState } from "@/lib/actions/employees";
import { FormField, Select, TextInput } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";

type Department = { id: string; name: string };

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: "dept_head" | "team_member";
  department_id: string | null;
  is_active: boolean;
};

export function EmployeeForm({
  employee,
  departments,
}: {
  employee?: Employee;
  departments: Department[];
}) {
  const action = employee ? updateEmployee : createEmployee;
  const [state, formAction] = useActionState<EmployeeState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-8 flex max-w-lg flex-col gap-4">
      {employee && <input type="hidden" name="id" value={employee.id} />}

      <FormField label="Full name" htmlFor="full_name">
        <TextInput id="full_name" name="full_name" required defaultValue={employee?.full_name} />
      </FormField>

      {!employee && (
        <>
          <FormField label="Work email" htmlFor="email">
            <TextInput id="email" name="email" type="email" required placeholder="name@ripplr.com" />
          </FormField>

          <FormField label="Password" htmlFor="password" hint="At least 8 characters. The account is created already verified.">
            <TextInput id="password" name="password" type="password" required minLength={8} />
          </FormField>
        </>
      )}

      <FormField label="Role" htmlFor="role">
        <Select id="role" name="role" required defaultValue={employee?.role ?? ""}>
          <option value="" disabled>
            Select a role
          </option>
          <option value="dept_head">Dept Head</option>
          <option value="team_member">Team Member</option>
        </Select>
      </FormField>

      <FormField label="Department" htmlFor="department_id">
        <Select id="department_id" name="department_id" required defaultValue={employee?.department_id ?? ""}>
          <option value="" disabled>
            Select a department
          </option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Avatar" htmlFor="avatar" hint="PNG, JPEG, or WebP, up to 5MB.">
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200"
        />
      </FormField>

      {employee && (
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="is_active" defaultChecked={employee.is_active} />
          Active
        </label>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton
        pendingLabel={employee ? "Saving..." : "Creating..."}
        className="mt-2 flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-brand-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
      >
        {employee ? "Save changes" : "Create employee"}
      </SubmitButton>
    </form>
  );
}

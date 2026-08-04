"use client";

import { useActionState, useState } from "react";
import { promoteToAdmin, demoteAdmin, setCeo, type AdminActionState } from "@/lib/actions/admins";
import { SubmitButton } from "@/components/submit-button";
import { Select } from "@/components/ui/form-field";

const linkButtonClasses =
  "text-sm font-medium text-brand-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-teal-400";

export function SetCeoButton({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(setCeo, undefined);
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="user_id" value={userId} />
      <SubmitButton pendingLabel="Setting CEO..." className={linkButtonClasses}>
        Make CEO
      </SubmitButton>
      {state?.error && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

export function PromoteAdminButton({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(promoteToAdmin, undefined);
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="user_id" value={userId} />
      <SubmitButton pendingLabel="Promoting..." className={linkButtonClasses}>
        Make Admin
      </SubmitButton>
      {state?.error && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

export function DemoteAdminForm({
  userId,
  departments,
}: {
  userId: string;
  departments: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AdminActionState, FormData>(demoteAdmin, undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={linkButtonClasses}>
        Remove Admin
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <Select name="role" required defaultValue="" className="!py-1.5 text-xs">
        <option value="" disabled>
          New role
        </option>
        <option value="dept_head">Dept Head</option>
        <option value="team_member">Team Member</option>
      </Select>
      <Select name="department_id" required defaultValue="" className="!py-1.5 text-xs">
        <option value="" disabled>
          Department
        </option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </Select>
      <SubmitButton pendingLabel="Saving..." className={linkButtonClasses}>
        Confirm
      </SubmitButton>
      {state?.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

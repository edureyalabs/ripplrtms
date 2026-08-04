"use client";

import { useActionState } from "react";
import { setCeo, type AdminActionState } from "@/lib/actions/admins";
import { SubmitButton } from "@/components/submit-button";

export function SetCeoButton({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(setCeo, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="user_id" value={userId} />
      <SubmitButton
        pendingLabel="Setting CEO..."
        className="flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-brand-900 px-4 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-900/5 disabled:cursor-not-allowed disabled:opacity-70 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-400/10"
      >
        Set as CEO
      </SubmitButton>
      {state?.error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}

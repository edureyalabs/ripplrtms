"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type PhaseState = { error?: string } | undefined;

function revalidateTask(id: string) {
  revalidatePath(`/dashboard/tasks/${id}`);
}

export async function acceptTaskPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const taskId = String(formData.get("task_id") ?? "");
  if (!phaseId) return { error: "Missing phase." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("accept_task_phase", { p_phase_id: phaseId });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not accept that phase.") };
  }

  if (taskId) revalidateTask(taskId);
}

export async function rejectTaskPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const taskId = String(formData.get("task_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!phaseId || !reason) return { error: "A reason is required." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reject_task_phase", {
      p_phase_id: phaseId,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not reject that phase.") };
  }

  if (taskId) revalidateTask(taskId);
}

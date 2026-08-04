"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type PhaseState = { error?: string } | undefined;

function revalidateTask(id: string) {
  revalidatePath(`/dashboard/tasks/${id}`);
}

function revalidateProject(id: string) {
  revalidatePath(`/dashboard/projects/${id}`);
}

export async function submitTaskPhases(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const taskId = String(formData.get("task_id") ?? "");
  const phaseIds = formData.getAll("phase_ids").map(String);

  if (!taskId || phaseIds.length === 0) {
    return { error: "Select at least one phase to submit." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_task_phases", {
      p_task_id: taskId,
      p_phase_ids: phaseIds,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not submit those phases.") };
  }

  revalidateTask(taskId);
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

export async function submitProjectPhases(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const projectId = String(formData.get("project_id") ?? "");
  const phaseIds = formData.getAll("phase_ids").map(String);

  if (!projectId || phaseIds.length === 0) {
    return { error: "Select at least one phase to submit." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_project_phases", {
      p_project_id: projectId,
      p_phase_ids: phaseIds,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not submit those phases.") };
  }

  revalidateProject(projectId);
}

export async function acceptProjectPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!phaseId) return { error: "Missing phase." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("accept_project_phase", { p_phase_id: phaseId });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not accept that phase.") };
  }

  if (projectId) revalidateProject(projectId);
}

export async function rejectProjectPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!phaseId || !reason) return { error: "A reason is required." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reject_project_phase", {
      p_phase_id: phaseId,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not reject that phase.") };
  }

  if (projectId) revalidateProject(projectId);
}

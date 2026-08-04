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

export async function addTaskPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const taskId = String(formData.get("task_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!taskId || !name) return { error: "Enter a phase name." };

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("task_phases")
      .select("position")
      .eq("task_id", taskId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPosition = (existing?.[0]?.position ?? -1) + 1;

    const { error } = await supabase
      .from("task_phases")
      .insert({ task_id: taskId, name, position: nextPosition });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not add that phase.") };
  }

  revalidateTask(taskId);
}

export async function deleteTaskPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const taskId = String(formData.get("task_id") ?? "");
  if (!phaseId) return { error: "Missing phase." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("task_phases").delete().eq("id", phaseId);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not delete that phase.") };
  }

  if (taskId) revalidateTask(taskId);
}

export async function addProjectPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const projectId = String(formData.get("project_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!projectId || !name) return { error: "Enter a phase name." };

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("project_phases")
      .select("position")
      .eq("project_id", projectId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPosition = (existing?.[0]?.position ?? -1) + 1;

    const { error } = await supabase
      .from("project_phases")
      .insert({ project_id: projectId, name, position: nextPosition });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not add that phase.") };
  }

  revalidateProject(projectId);
}

export async function deleteProjectPhase(
  _prevState: PhaseState,
  formData: FormData
): Promise<PhaseState> {
  const phaseId = String(formData.get("phase_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!phaseId) return { error: "Missing phase." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("project_phases").delete().eq("id", phaseId);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not delete that phase.") };
  }

  if (projectId) revalidateProject(projectId);
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

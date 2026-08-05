"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";
import { parsePhaseNames } from "@/lib/phase-names";
import type { Enums } from "@/lib/types/database";

export type TaskState = { error?: string; success?: boolean } | undefined;

export async function createTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let projectId = String(formData.get("project_id") ?? "") || null;
  const newProjectName = String(formData.get("new_project_name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const assigneeIds = formData.getAll("assignee_ids").map(String).filter(Boolean);
  const collaboratorIds = formData
    .getAll("collaborator_ids")
    .map(String)
    .filter((id) => id && !assigneeIds.includes(id));

  if (!name || !startDate || !endDate) {
    return { error: "Name, start date, and end date are required." };
  }
  if (name.length > 400) {
    return { error: "Task name must be 400 characters or fewer." };
  }
  if (description.length > 1000) {
    return { error: "Description must be 1000 characters or fewer." };
  }
  if (endDate < startDate) {
    return { error: "End date must be on or after the start date." };
  }
  if (assigneeIds.length === 0) {
    return { error: "At least one assignee is required." };
  }
  if (!projectId && newProjectName.length > 200) {
    return { error: "Project name must be 200 characters or fewer." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (startDate < today) {
    return { error: "Start date can't be in the past." };
  }

  let newTaskId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    if (!projectId && newProjectName) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({ name: newProjectName, created_by: user.id })
        .select("id")
        .single();
      if (projectError || !project) {
        throw new Error(projectError?.message ?? "Could not create the project.");
      }
      projectId = project.id;
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        name,
        description: description || null,
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (taskError || !task) {
      throw new Error(taskError?.message ?? "Could not create the task.");
    }

    const memberRows = [
      ...assigneeIds.map((userId) => ({
        task_id: task.id,
        user_id: userId,
        role: "assignee" as const,
        added_by: user.id,
      })),
      ...collaboratorIds.map((userId) => ({
        task_id: task.id,
        user_id: userId,
        role: "collaborator" as const,
        added_by: user.id,
      })),
    ];

    const { error: membersError } = await supabase.from("task_members").insert(memberRows);
    if (membersError) {
      throw new Error(membersError.message);
    }

    const phaseNames = parsePhaseNames(String(formData.get("phases") ?? ""));
    if (phaseNames.length > 0) {
      const { error: phasesError } = await supabase.from("task_phases").insert(
        phaseNames.map((phaseName, index) => ({
          task_id: task.id,
          name: phaseName,
          position: index,
        }))
      );
      if (phasesError) {
        throw new Error(phasesError.message);
      }
    }

    newTaskId = task.id;
  } catch (err) {
    return { error: getErrorMessage(err, "Could not create the task.") };
  }

  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/tasks/${newTaskId}`);
}

export async function updateTaskDetails(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");

  if (!id || !name || !startDate || !endDate) {
    return { error: "Name, start date, and end date are required." };
  }
  if (name.length > 400) {
    return { error: "Task name must be 400 characters or fewer." };
  }
  if (description.length > 1000) {
    return { error: "Description must be 1000 characters or fewer." };
  }
  if (endDate < startDate) {
    return { error: "End date must be on or after the start date." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not update the task.") };
  }

  revalidatePath(`/dashboard/tasks/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTaskStatus(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Enums<"task_status">;

  if (!id || !status) {
    return { error: "Missing task or status." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not update the task status.") };
  }

  revalidatePath(`/dashboard/tasks/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteTask(_prevState: TaskState, formData: FormData): Promise<TaskState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing task." };

  let projectId: string | null = null;

  try {
    const supabase = await createClient();
    const { data: task } = await supabase.from("tasks").select("project_id").eq("id", id).single();
    projectId = task?.project_id ?? null;

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not delete the task.") };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/overview/tasks");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(projectId ? `/dashboard/projects/${projectId}` : "/dashboard");
}

export async function rejectTaskSubmission(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!id || !reason) {
    return { error: "A reason is required to reject a submission." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reject_task_submission", {
      p_task_id: id,
      p_reason: reason,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not reject the submission.") };
  }

  revalidatePath(`/dashboard/tasks/${id}`);
  revalidatePath("/dashboard");
}

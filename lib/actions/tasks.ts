"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";
import type { Enums } from "@/lib/types/database";

export type TaskState = { error?: string } | undefined;

export async function createTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "") || null;
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
  if (endDate < startDate) {
    return { error: "End date must be on or after the start date." };
  }
  if (assigneeIds.length === 0) {
    return { error: "At least one assignee is required." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
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

    revalidatePath("/dashboard");
    if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
    redirect(`/dashboard/tasks/${task.id}`);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not create the task.") };
  }
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

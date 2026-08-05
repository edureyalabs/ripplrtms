"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type TaskUpdateState = { error?: string; success?: boolean } | undefined;

const ALLOWED_ATTACHMENT_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/**
 * The single entry point for a doer's progress update on a task: posts the
 * remark (+ optional attachment), auto-opens the task on the first update,
 * and can mark selected pending phases as submitted-for-review in the same
 * action so it all lands as one coherent moment in the activity log.
 */
export async function submitTaskUpdate(
  _prevState: TaskUpdateState,
  formData: FormData
): Promise<TaskUpdateState> {
  const taskId = String(formData.get("task_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const attachment = formData.get("attachment");
  const phaseIds = formData.getAll("phase_ids").map(String).filter(Boolean);

  if (!taskId || !body) {
    return { error: "Write something before posting." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: task } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", taskId)
      .single();
    if (!task) return { error: "Task not found." };
    if (task.status !== "open" && task.status !== "in_progress") {
      return { error: "This task can't accept updates right now." };
    }

    const { data: pendingReview } = await supabase
      .from("task_phases")
      .select("id")
      .eq("task_id", taskId)
      .eq("status", "submitted")
      .limit(1);
    if ((pendingReview ?? []).length > 0) {
      return { error: "A phase is awaiting review — wait for a decision before posting another update." };
    }

    if (task.status === "open") {
      const { error: statusError } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", taskId);
      if (statusError) throw new Error(statusError.message);
    }

    const { data: update, error: updateError } = await supabase
      .from("task_updates")
      .insert({ task_id: taskId, author_id: user.id, body })
      .select("id")
      .single();
    if (updateError || !update) {
      throw new Error(updateError?.message ?? "Could not post the update.");
    }

    if (attachment instanceof File && attachment.size > 0) {
      const ext = ALLOWED_ATTACHMENT_MIME[attachment.type];
      if (!ext) {
        throw new Error("Attachments must be an image, PDF, Word, or Excel file.");
      }
      const path = `task/${taskId}/${update.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(path, attachment, { contentType: attachment.type });
      if (uploadError) {
        throw new Error(`Attachment upload failed: ${uploadError.message}`);
      }
      const { error: attachError } = await supabase.from("task_update_attachments").insert({
        update_id: update.id,
        file_path: path,
        file_name: attachment.name,
        mime_type: attachment.type,
        size_bytes: attachment.size,
      });
      if (attachError) {
        throw new Error(attachError.message);
      }
    }

    if (phaseIds.length > 0) {
      const { error: phaseError } = await supabase.rpc("submit_task_phases", {
        p_task_id: taskId,
        p_phase_ids: phaseIds,
      });
      if (phaseError) throw new Error(phaseError.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not post the update.") };
  }

  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

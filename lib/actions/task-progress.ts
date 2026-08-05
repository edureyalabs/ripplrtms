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

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_BODY_LENGTH = 1000;

async function uploadAttachments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  files: File[],
  pathPrefix: string,
  updateId: string
) {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_ATTACHMENTS} files per update.`);
  }
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`"${file.name}" is over the 5MB limit.`);
    }
    const ext = ALLOWED_ATTACHMENT_MIME[file.type];
    if (!ext) {
      throw new Error("Attachments must be an image, PDF, Word, or Excel file.");
    }
  }

  for (const file of files) {
    const ext = ALLOWED_ATTACHMENT_MIME[file.type];
    const path = `${pathPrefix}/${updateId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      throw new Error(`Attachment upload failed: ${uploadError.message}`);
    }
    const { error: attachError } = await supabase.from("task_update_attachments").insert({
      update_id: updateId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (attachError) {
      throw new Error(attachError.message);
    }
  }
}

/**
 * The single entry point for a doer's progress update on a task: posts the
 * remark (+ optional attachments), auto-opens the task on the first update,
 * and can mark selected pending phases as submitted-for-review in the same
 * action so it all lands as one coherent moment in the activity log.
 */
export async function submitTaskUpdate(
  _prevState: TaskUpdateState,
  formData: FormData
): Promise<TaskUpdateState> {
  const taskId = String(formData.get("task_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const files = formData.getAll("attachment").filter((f): f is File => f instanceof File && f.size > 0);
  const phaseIds = formData.getAll("phase_ids").map(String).filter(Boolean);

  if (!taskId || !body) {
    return { error: "Write something before posting." };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { error: `Keep updates under ${MAX_BODY_LENGTH} characters.` };
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

    const { data: membership } = await supabase
      .from("task_members")
      .select("role")
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .eq("role", "assignee")
      .maybeSingle();
    const isAssignee = !!membership;

    // Only an assignee can move the task from Open to In Progress (DB-enforced);
    // a creator-only update just gets logged without changing status.
    if (task.status === "open" && isAssignee) {
      const { error: statusError } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", taskId);
      if (statusError) throw new Error(statusError.message);
    }

    const { data: update, error: updateError } = await supabase
      .from("task_updates")
      .insert({ task_id: taskId, author_id: user.id, body, kind: "manual_update" })
      .select("id")
      .single();
    if (updateError || !update) {
      throw new Error(updateError?.message ?? "Could not post the update.");
    }

    await uploadAttachments(supabase, files, `task/${taskId}`, update.id);

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

/**
 * CEO, the task creator, and collaborators can leave a review — a separate
 * log entry from the doer's progress updates, enforced by RLS on
 * task_updates.kind = 'review'.
 */
export async function submitTaskReview(
  _prevState: TaskUpdateState,
  formData: FormData
): Promise<TaskUpdateState> {
  const taskId = String(formData.get("task_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const files = formData.getAll("attachment").filter((f): f is File => f instanceof File && f.size > 0);

  if (!taskId || !body) {
    return { error: "Write something before posting." };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { error: `Keep reviews under ${MAX_BODY_LENGTH} characters.` };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: update, error: updateError } = await supabase
      .from("task_updates")
      .insert({ task_id: taskId, author_id: user.id, body, kind: "review" })
      .select("id")
      .single();
    if (updateError || !update) {
      throw new Error(updateError?.message ?? "Could not post the review.");
    }

    await uploadAttachments(supabase, files, `task/${taskId}`, update.id);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not post the review.") };
  }

  revalidatePath(`/dashboard/tasks/${taskId}`);
  return { success: true };
}

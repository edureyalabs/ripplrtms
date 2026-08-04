"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type UpdateState = { error?: string } | undefined;

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

export async function postTaskUpdate(
  _prevState: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  const taskId = String(formData.get("task_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const attachment = formData.get("attachment");

  if (!taskId || !body) {
    return { error: "Write something before posting." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

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
  } catch (err) {
    return { error: getErrorMessage(err, "Could not post the update.") };
  }

  revalidatePath(`/dashboard/tasks/${taskId}`);
}

export async function postProjectUpdate(
  _prevState: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const attachment = formData.get("attachment");

  if (!projectId || !body) {
    return { error: "Write something before posting." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: update, error: updateError } = await supabase
      .from("project_updates")
      .insert({ project_id: projectId, author_id: user.id, body })
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
      const path = `project/${projectId}/${update.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(path, attachment, { contentType: attachment.type });
      if (uploadError) {
        throw new Error(`Attachment upload failed: ${uploadError.message}`);
      }
      const { error: attachError } = await supabase.from("project_update_attachments").insert({
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
  } catch (err) {
    return { error: getErrorMessage(err, "Could not post the update.") };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
}

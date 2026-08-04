"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type MessageState = { error?: string } | undefined;

export async function postTaskMessage(
  _prevState: MessageState,
  formData: FormData
): Promise<MessageState> {
  const taskId = String(formData.get("task_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!taskId || !body) return { error: "Message can't be empty." };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { error } = await supabase
      .from("task_messages")
      .insert({ task_id: taskId, sender_id: user.id, body });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not send that message.") };
  }

  revalidatePath(`/dashboard/tasks/${taskId}`);
}

export async function postProjectMessage(
  _prevState: MessageState,
  formData: FormData
): Promise<MessageState> {
  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!projectId || !body) return { error: "Message can't be empty." };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { error } = await supabase
      .from("project_messages")
      .insert({ project_id: projectId, sender_id: user.id, body });
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not send that message.") };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
}

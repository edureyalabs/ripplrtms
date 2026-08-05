"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type MessageState = { error?: string } | undefined;

export type ChatMessage = {
  id: string;
  body: string;
  created_at: string;
  senderName: string;
  senderAvatarPath: string | null;
};

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

const PAGE_SIZE = 20;

/** Latest page of a task's chat, oldest-first for display. */
export async function getLatestTaskMessages(taskId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_messages")
    .select("id, body, created_at, sender:profiles!task_messages_sender_id_fkey(full_name, email, avatar_path)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  return (data ?? [])
    .map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      senderName: m.sender ? m.sender.full_name || m.sender.email : "Someone",
      senderAvatarPath: m.sender?.avatar_path ?? null,
    }))
    .reverse();
}

/** The next older page, for infinite-scroll-up. */
export async function getOlderTaskMessages(taskId: string, before: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_messages")
    .select("id, body, created_at, sender:profiles!task_messages_sender_id_fkey(full_name, email, avatar_path)")
    .eq("task_id", taskId)
    .lt("created_at", before)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  return (data ?? [])
    .map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      senderName: m.sender ? m.sender.full_name || m.sender.email : "Someone",
      senderAvatarPath: m.sender?.avatar_path ?? null,
    }))
    .reverse();
}

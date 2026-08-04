"use client";

import { useActionState } from "react";
import { postTaskMessage, postProjectMessage, type MessageState } from "@/lib/actions/messages";
import { TextInput } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/submit-button";
import { Avatar } from "@/components/ui/avatar";

type Message = {
  id: string;
  body: string;
  created_at: string;
  senderName: string;
  senderAvatarPath: string | null;
};

export function ChatPanel({
  parentType,
  parentId,
  messages,
}: {
  parentType: "task" | "project";
  parentId: string;
  messages: Message[];
}) {
  const action = parentType === "task" ? postTaskMessage : postProjectMessage;
  const [state, formAction] = useActionState<MessageState, FormData>(action, undefined);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No messages yet.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-2">
              <Avatar name={m.senderName} avatarPath={m.senderAvatarPath} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {m.senderName}{" "}
                  <span className="font-normal text-zinc-400 dark:text-zinc-600">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </p>
                <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                  {m.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
        <TextInput name="body" placeholder="Message..." required className="flex-1" />
        <SubmitButton
          pendingLabel="Sending..."
          className="flex h-9 shrink-0 items-center justify-center rounded-md bg-accent-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          Send
        </SubmitButton>
      </form>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}

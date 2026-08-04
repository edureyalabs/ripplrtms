"use client";

import { useActionState, useEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    if (!state?.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <ChatIcon />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No messages yet.</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Say hello to get the conversation going.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5">
                <Avatar name={m.senderName} avatarPath={m.senderAvatarPath} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {m.senderName}
                    </p>
                    <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600">
                      {new Date(m.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-1 inline-block max-w-full rounded-2xl rounded-tl-sm bg-surface-50 px-3 py-2 text-sm text-zinc-800 dark:bg-surface-50-dark dark:text-zinc-200">
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex items-center gap-2 border-t border-surface-border p-3 dark:border-surface-border-dark"
      >
        <input type="hidden" name={parentType === "task" ? "task_id" : "project_id"} value={parentId} />
        <TextInput
          name="body"
          placeholder="Message the team..."
          required
          autoComplete="off"
          className="flex-1"
        />
        <SubmitButton
          pendingLabel="..."
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          <SendIcon />
        </SubmitButton>
      </form>
      {state?.error && (
        <p className="px-3 pb-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M2.94 2.06a.75.75 0 0 0-.94.94l2.2 6.5a.75.75 0 0 0 .59.5l7.28.94-7.28.94a.75.75 0 0 0-.59.5l-2.2 6.5a.75.75 0 0 0 .94.94 63.6 63.6 0 0 0 16.42-8.94.75.75 0 0 0 0-1.28A63.6 63.6 0 0 0 2.94 2.06Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-8 w-8 text-zinc-300 dark:text-zinc-700"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
      />
    </svg>
  );
}

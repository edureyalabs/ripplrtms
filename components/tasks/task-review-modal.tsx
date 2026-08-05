"use client";

import { submitTaskReview } from "@/lib/actions/task-progress";
import { LogEntryModal } from "@/components/tasks/log-entry-modal";

export function TaskReviewModal({ taskId }: { taskId: string }) {
  return (
    <LogEntryModal
      taskId={taskId}
      action={submitTaskReview}
      triggerLabel="Add Review"
      triggerIcon={<ReviewIcon />}
      triggerClassName="flex h-9 items-center justify-center gap-2 rounded-md border border-purple-200 px-4 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-900 dark:text-purple-400 dark:hover:bg-purple-950/30"
      modalTitle="Add a review"
      bodyPlaceholder="Share feedback on progress so far..."
      submitLabel="Post review"
    />
  );
}

function ReviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10 2.5 12.4 7l4.9.7-3.55 3.46L14.6 16 10 13.6 5.4 16l.85-4.84L2.7 7.7 7.6 7 10 2.5Z" />
    </svg>
  );
}

export const TASK_STATUS_TONE = {
  open: "neutral",
  in_progress: "accent",
  submitted: "warning",
  completed: "success",
  terminated: "danger",
} as const;

export const PHASE_STATUS_TONE = {
  pending: "neutral",
  submitted: "warning",
  accepted: "success",
} as const;

export const TASK_STATUS_LABEL: Record<keyof typeof TASK_STATUS_TONE, string> = {
  open: "Open",
  in_progress: "In Progress",
  submitted: "Submitted",
  completed: "Completed",
  terminated: "Terminated",
};

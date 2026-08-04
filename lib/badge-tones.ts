export const TASK_STATUS_TONE = {
  open: "neutral",
  in_progress: "accent",
  submitted: "warning",
  completed: "success",
  terminated: "danger",
} as const;

export const PROJECT_STATUS_TONE = {
  open: "neutral",
  in_progress: "accent",
  completed: "success",
  closed: "neutral",
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

export const PROJECT_STATUS_LABEL: Record<keyof typeof PROJECT_STATUS_TONE, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

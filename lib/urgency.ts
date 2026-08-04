export type Urgency = "overdue" | "today" | "soon" | "later" | "done";

const DONE_STATUSES = new Set(["completed", "terminated"]);

/** Classifies a deadline into an urgency bucket, relative to today (local date). */
export function classifyUrgency(endDate: string, status: string): Urgency {
  if (DONE_STATUSES.has(status)) return "done";

  const today = new Date().toISOString().slice(0, 10);
  if (endDate < today) return "overdue";
  if (endDate === today) return "today";

  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  if (endDate <= soon.toISOString().slice(0, 10)) return "soon";

  return "later";
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  overdue: "Overdue",
  today: "Due today",
  soon: "Due soon",
  later: "On track",
  done: "Done",
};

export const URGENCY_DOT: Record<Urgency, string> = {
  overdue: "bg-red-500",
  today: "bg-amber-500",
  soon: "bg-blue-500",
  later: "bg-zinc-300 dark:bg-zinc-600",
  done: "bg-emerald-500",
};

export const URGENCY_BADGE_TONE: Record<Urgency, "danger" | "warning" | "accent" | "neutral" | "success"> = {
  overdue: "danger",
  today: "warning",
  soon: "accent",
  later: "neutral",
  done: "success",
};

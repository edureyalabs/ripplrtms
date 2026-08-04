import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Enums } from "@/lib/types/database";
import { classifyUrgency } from "@/lib/urgency";

export type MyTask = {
  id: string;
  name: string;
  status: Enums<"task_status">;
  start_date: string;
  end_date: string;
  project: { id: string; name: string } | null;
};

export async function getMyTasks(supabase: SupabaseClient<Database>, userId: string): Promise<MyTask[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, name, status, start_date, end_date, projects(id, name), task_members!inner(user_id)"
    )
    .eq("task_members.user_id", userId)
    .order("end_date");

  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    start_date: t.start_date,
    end_date: t.end_date,
    project: t.projects,
  }));
}

export function summarizeTasks(tasks: { status: string; start_date: string; end_date: string }[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    open: tasks.filter((t) => t.status === "open").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    submitted: tasks.filter((t) => t.status === "submitted").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    notStarted: tasks.filter((t) => t.status === "open" && t.start_date < today).length,
    deadlineCrossed: tasks.filter(
      (t) => !["completed", "terminated"].includes(t.status) && t.end_date < today
    ).length,
    dueToday: tasks.filter((t) => classifyUrgency(t.end_date, t.status) === "today").length,
  };
}

/** Sort by urgency (overdue/today first), then by end_date. */
export function prioritizeTasks<T extends { status: string; end_date: string }>(tasks: T[]): T[] {
  const rank: Record<string, number> = { overdue: 0, today: 1, soon: 2, later: 3, done: 4 };
  return [...tasks].sort((a, b) => {
    const ra = rank[classifyUrgency(a.end_date, a.status)];
    const rb = rank[classifyUrgency(b.end_date, b.status)];
    if (ra !== rb) return ra - rb;
    return a.end_date.localeCompare(b.end_date);
  });
}

export async function getMyCompletionStats(supabase: SupabaseClient<Database>, userId: string) {
  const { data: assignedTasks } = await supabase
    .from("task_members")
    .select("task_id")
    .eq("user_id", userId)
    .eq("role", "assignee");

  const taskIds = (assignedTasks ?? []).map((t) => t.task_id);
  if (taskIds.length === 0) return { thisWeek: 0, thisMonth: 0 };

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: events } = await supabase
    .from("task_events")
    .select("created_at")
    .in("task_id", taskIds)
    .eq("kind", "status_change")
    .eq("to_status", "completed")
    .gte("created_at", startOfMonth.toISOString());

  const rows = events ?? [];
  return {
    thisWeek: rows.filter((e) => new Date(e.created_at) >= startOfWeek).length,
    thisMonth: rows.length,
  };
}

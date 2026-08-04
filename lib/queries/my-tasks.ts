import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export async function getMyTasks(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, name, status, start_date, end_date, task_members!inner(user_id)")
    .eq("task_members.user_id", userId)
    .order("end_date");

  if (error) throw new Error(error.message);
  return data ?? [];
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
  };
}

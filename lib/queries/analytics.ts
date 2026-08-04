import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type ProjectSummary = {
  id: string;
  name: string;
  status: string;
  deadline: string;
  leadName: string | null;
  leadAvatarPath: string | null;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
};

export async function getProjectSummaries(
  supabase: SupabaseClient<Database>
): Promise<ProjectSummary[]> {
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, deadline, lead:profiles!projects_lead_id_fkey(full_name, email, avatar_path)")
      .neq("status", "closed")
      .order("deadline"),
    supabase.from("tasks").select("project_id, status, end_date").not("project_id", "is", null),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const byProject = new Map<string, { total: number; completed: number; overdue: number }>();
  for (const t of tasks ?? []) {
    if (!t.project_id) continue;
    const bucket = byProject.get(t.project_id) ?? { total: 0, completed: 0, overdue: 0 };
    bucket.total += 1;
    if (t.status === "completed") bucket.completed += 1;
    if (!["completed", "terminated"].includes(t.status) && t.end_date < today) bucket.overdue += 1;
    byProject.set(t.project_id, bucket);
  }

  return (projects ?? []).map((p) => {
    const bucket = byProject.get(p.id) ?? { total: 0, completed: 0, overdue: 0 };
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      deadline: p.deadline,
      leadName: p.lead ? p.lead.full_name || p.lead.email : null,
      leadAvatarPath: p.lead?.avatar_path ?? null,
      totalTasks: bucket.total,
      completedTasks: bucket.completed,
      overdueTasks: bucket.overdue,
    };
  });
}

export type CompanyPulse = {
  activeProjects: number;
  completedThisWeek: number;
  completedThisMonth: number;
  overdueTasks: number;
};

export async function getCompanyPulse(supabase: SupabaseClient<Database>): Promise<CompanyPulse> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.toISOString().slice(0, 10);

  const [{ count: activeProjects }, { data: completions }, { count: overdueTasks }] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase
      .from("task_events")
      .select("created_at")
      .eq("kind", "status_change")
      .eq("to_status", "completed")
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(completed,terminated)")
      .lt("end_date", today),
  ]);

  const rows = completions ?? [];
  return {
    activeProjects: activeProjects ?? 0,
    completedThisWeek: rows.filter((e) => new Date(e.created_at) >= startOfWeek).length,
    completedThisMonth: rows.length,
    overdueTasks: overdueTasks ?? 0,
  };
}

export type DepartmentTask = {
  id: string;
  name: string;
  status: string;
  end_date: string;
  projectName: string | null;
  assigneeNames: string[];
};

export async function getDepartmentTasks(
  supabase: SupabaseClient<Database>,
  departmentId: string
): Promise<DepartmentTask[]> {
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("department_id", departmentId);

  const memberIds = (members ?? []).map((m) => m.id);
  if (memberIds.length === 0) return [];

  const { data: taskMembers } = await supabase
    .from("task_members")
    .select("task_id")
    .eq("role", "assignee")
    .in("user_id", memberIds);

  const taskIds = [...new Set((taskMembers ?? []).map((tm) => tm.task_id))];
  if (taskIds.length === 0) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, name, status, end_date, projects(name), task_members(role, profiles!task_members_user_id_fkey(full_name, email))"
    )
    .in("id", taskIds)
    .order("end_date");

  return (tasks ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    end_date: t.end_date,
    projectName: t.projects?.name ?? null,
    assigneeNames: (t.task_members ?? [])
      .filter((m) => m.role === "assignee" && m.profiles)
      .map((m) => m.profiles!.full_name || m.profiles!.email),
  }));
}

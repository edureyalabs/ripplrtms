import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type ProjectSummary = {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
};

export async function getProjectSummaries(
  supabase: SupabaseClient<Database>
): Promise<ProjectSummary[]> {
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("id, name").order("name"),
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
      totalTasks: bucket.total,
      completedTasks: bucket.completed,
      overdueTasks: bucket.overdue,
    };
  });
}

export type CompanyPulse = {
  totalProjects: number;
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

  const [{ count: totalProjects }, { data: completions }, { count: overdueTasks }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
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
    totalProjects: totalProjects ?? 0,
    completedThisWeek: rows.filter((e) => new Date(e.created_at) >= startOfWeek).length,
    completedThisMonth: rows.length,
    overdueTasks: overdueTasks ?? 0,
  };
}

export type TaskRow = {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  createdByName: string;
  projectName: string | null;
  assigneeNames: string[];
};

const TASK_ROW_SELECT =
  "id, name, status, start_date, end_date, projects(name), creator:profiles!tasks_created_by_fkey(full_name, email), task_members(role, profiles!task_members_user_id_fkey(full_name, email))";

function mapTaskRow(t: {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  projects: { name: string } | null;
  creator: { full_name: string; email: string } | null;
  task_members: { role: string; profiles: { full_name: string; email: string } | null }[] | null;
}): TaskRow {
  return {
    id: t.id,
    name: t.name,
    status: t.status,
    start_date: t.start_date,
    end_date: t.end_date,
    createdByName: t.creator ? t.creator.full_name || t.creator.email : "—",
    projectName: t.projects?.name ?? null,
    assigneeNames: (t.task_members ?? [])
      .filter((m) => m.role === "assignee" && m.profiles)
      .map((m) => m.profiles!.full_name || m.profiles!.email),
  };
}

export async function getDepartmentTasks(
  supabase: SupabaseClient<Database>,
  departmentId: string
): Promise<TaskRow[]> {
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
    .select(TASK_ROW_SELECT)
    .in("id", taskIds)
    .order("end_date");

  return (tasks ?? []).map(mapTaskRow);
}

export async function getProjectTasks(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<TaskRow[]> {
  const { data: tasks } = await supabase
    .from("tasks")
    .select(TASK_ROW_SELECT)
    .eq("project_id", projectId)
    .order("end_date");

  return (tasks ?? []).map(mapTaskRow);
}

export type TaskFilters = {
  departmentId?: string;
  projectId?: string;
  employeeId?: string;
  status?: string;
};

/** Company-wide task browser for admin/ceo, filterable by department, project, assignee, and status. */
export async function getAllTasks(
  supabase: SupabaseClient<Database>,
  filters: TaskFilters
): Promise<TaskRow[]> {
  let taskIdFilter: string[] | null = null;

  if (filters.departmentId) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id")
      .eq("department_id", filters.departmentId);
    const memberIds = (members ?? []).map((m) => m.id);
    const { data: taskMembers } = memberIds.length
      ? await supabase.from("task_members").select("task_id").eq("role", "assignee").in("user_id", memberIds)
      : { data: [] };
    taskIdFilter = [...new Set((taskMembers ?? []).map((tm) => tm.task_id))];
  }

  if (filters.employeeId) {
    const { data: taskMembers } = await supabase
      .from("task_members")
      .select("task_id")
      .eq("user_id", filters.employeeId);
    const ids = [...new Set((taskMembers ?? []).map((tm) => tm.task_id))];
    taskIdFilter = taskIdFilter ? taskIdFilter.filter((id) => ids.includes(id)) : ids;
  }

  if (taskIdFilter && taskIdFilter.length === 0) return [];

  let query = supabase.from("tasks").select(TASK_ROW_SELECT).order("end_date");
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.status) query = query.eq("status", filters.status as never);
  if (taskIdFilter) query = query.in("id", taskIdFilter);

  const { data: tasks } = await query;
  return (tasks ?? []).map(mapTaskRow);
}

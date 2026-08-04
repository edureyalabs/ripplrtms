import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type DepartmentRollup = {
  departmentId: string;
  departmentName: string;
  deptHeadId: string | null;
  deptHeadName: string | null;
  deptHeadAvatarPath: string | null;
  memberCount: number;
  openCount: number;
  inProgressCount: number;
  submittedCount: number;
  completedCount: number;
  overdueNotStartedCount: number;
  overdueDeadlineCount: number;
};

export async function getDepartmentRollup(
  supabase: SupabaseClient<Database>,
  departmentId: string,
  departmentName: string
): Promise<DepartmentRollup | null> {
  const { data, error } = await supabase.rpc("department_task_rollup", {
    p_department_id: departmentId,
  });
  if (error || !data || data.length === 0) return null;

  const row = data[0];
  return {
    departmentId,
    departmentName,
    deptHeadId: row.dept_head_id,
    deptHeadName: row.dept_head_name,
    deptHeadAvatarPath: row.dept_head_avatar_path,
    memberCount: row.member_count,
    openCount: row.open_count,
    inProgressCount: row.in_progress_count,
    submittedCount: row.submitted_count,
    completedCount: row.completed_count,
    overdueNotStartedCount: row.overdue_not_started_count,
    overdueDeadlineCount: row.overdue_deadline_count,
  };
}

export async function getAllDepartmentRollups(
  supabase: SupabaseClient<Database>
): Promise<DepartmentRollup[]> {
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (!departments) return [];

  const rollups = await Promise.all(
    departments.map((dept) => getDepartmentRollup(supabase, dept.id, dept.name))
  );

  return rollups.filter((r): r is DepartmentRollup => r !== null);
}

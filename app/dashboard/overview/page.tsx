import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { DepartmentRollupCard } from "@/components/dashboards/department-rollup-card";
import { getAllDepartmentRollups, getDepartmentRollup } from "@/lib/queries/dashboards";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me } = await supabase
    .from("profiles")
    .select("role, department_id")
    .eq("id", user.id)
    .single();

  if (!me || (me.role !== "admin" && me.role !== "ceo" && me.role !== "dept_head")) {
    redirect("/dashboard");
  }

  const isCommandCenter = me.role === "admin" || me.role === "ceo";

  const rollups = isCommandCenter
    ? await getAllDepartmentRollups(supabase)
    : me.department_id
      ? await (async () => {
          const { data: dept } = await supabase
            .from("departments")
            .select("id, name")
            .eq("id", me.department_id!)
            .single();
          if (!dept) return [];
          const rollup = await getDepartmentRollup(supabase, dept.id, dept.name);
          return rollup ? [rollup] : [];
        })()
      : [];

  const totals = rollups.reduce(
    (acc, r) => ({
      open: acc.open + r.openCount,
      inProgress: acc.inProgress + r.inProgressCount,
      submitted: acc.submitted + r.submittedCount,
      completed: acc.completed + r.completedCount,
      overdue: acc.overdue + r.overdueNotStartedCount + r.overdueDeadlineCount,
    }),
    { open: 0, inProgress: 0, submitted: 0, completed: 0, overdue: 0 }
  );

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        {isCommandCenter ? "Command Center" : "Team"}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {isCommandCenter ? "Company Overview" : "Department Overview"}
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        {isCommandCenter
          ? "Task status across every department."
          : "Task status across your department."}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Open" value={totals.open} />
        <StatTile label="In Progress" value={totals.inProgress} tone="progress" />
        <StatTile label="Submitted" value={totals.submitted} tone="submitted" />
        <StatTile label="Completed" value={totals.completed} tone="completed" />
        <StatTile label="Overdue" value={totals.overdue} tone="danger" />
      </div>

      {rollups.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No department data yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rollups.map((rollup) => (
            <DepartmentRollupCard key={rollup.departmentId} rollup={rollup} />
          ))}
        </div>
      )}
    </div>
  );
}

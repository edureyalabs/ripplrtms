import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { Card } from "@/components/ui/card";
import { DepartmentRollupCard } from "@/components/dashboards/department-rollup-card";
import { ProjectSummaryCard } from "@/components/dashboards/project-summary-card";
import { getAllDepartmentRollups, getDepartmentRollup } from "@/lib/queries/dashboards";
import { getCompanyPulse, getProjectSummaries } from "@/lib/queries/analytics";

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

  const [rollups, pulse, projects] = await Promise.all([
    isCommandCenter
      ? getAllDepartmentRollups(supabase)
      : me.department_id
        ? (async () => {
            const { data: dept } = await supabase
              .from("departments")
              .select("id, name")
              .eq("id", me.department_id!)
              .single();
            if (!dept) return [];
            const rollup = await getDepartmentRollup(supabase, dept.id, dept.name);
            return rollup ? [rollup] : [];
          })()
        : [],
    isCommandCenter ? getCompanyPulse(supabase) : Promise.resolve(null),
    isCommandCenter ? getProjectSummaries(supabase) : Promise.resolve([]),
  ]);

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

      {pulse && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Active Projects" value={pulse.activeProjects} />
          <StatTile label="Overdue Tasks" value={pulse.overdueTasks} tone="danger" />
          <StatTile label="Completed (Week)" value={pulse.completedThisWeek} tone="completed" />
          <StatTile label="Completed (Month)" value={pulse.completedThisMonth} tone="completed" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Open" value={totals.open} />
        <StatTile label="In Progress" value={totals.inProgress} tone="progress" />
        <StatTile label="Submitted" value={totals.submitted} tone="submitted" />
        <StatTile label="Completed" value={totals.completed} tone="completed" />
        <StatTile label="Overdue" value={totals.overdue} tone="danger" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Departments
        </h2>
      </div>
      {rollups.length === 0 ? (
        <Card className="mt-4">
          <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No department data yet.
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rollups.map((rollup) => (
            <DepartmentRollupCard
              key={rollup.departmentId}
              rollup={rollup}
              href={isCommandCenter ? `/dashboard/overview/departments/${rollup.departmentId}` : undefined}
            />
          ))}
        </div>
      )}

      {isCommandCenter && (
        <>
          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-500"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <Card className="mt-4">
              <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No active projects.
              </p>
            </Card>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectSummaryCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

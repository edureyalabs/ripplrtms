import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { TaskTable } from "@/components/tasks/task-table";
import { getProjectTasks } from "@/lib/queries/analytics";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const tasks = await getProjectTasks(supabase, projectId);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const overdue = tasks.filter(
    (t) => !["completed", "terminated"].includes(t.status) && t.end_date < new Date().toISOString().slice(0, 10)
  ).length;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Project
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {project.name}
        </h1>
        <Link
          href={`/dashboard/tasks/new?project=${project.id}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          New Task
        </Link>
      </div>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Every task tagged under this project.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label="Total Tasks" value={tasks.length} size="sm" />
        <StatTile label="In Progress" value={inProgress} tone="progress" size="sm" />
        <StatTile label="Completed" value={completed} tone="completed" size="sm" />
        <StatTile label="Overdue" value={overdue} tone="danger" size="sm" />
      </div>

      <div className="mt-6">
        <TaskTable tasks={tasks} emptyLabel="No tasks tagged with this project yet." />
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { getMyTasks, summarizeTasks } from "@/lib/queries/my-tasks";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const tasks = await getMyTasks(supabase, user.id);
  const stats = summarizeTasks(tasks);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            My Tasks
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            A snapshot of what&apos;s on your plate.
          </p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex h-10 items-center justify-center rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          New Task
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Open" value={stats.open} />
        <StatTile label="In Progress" value={stats.inProgress} tone="progress" />
        <StatTile label="Submitted" value={stats.submitted} tone="submitted" />
        <StatTile label="Completed" value={stats.completed} tone="completed" />
        <StatTile label="Not Started" value={stats.notStarted} tone="danger" hint="Past start date" />
        <StatTile label="Overdue" value={stats.deadlineCrossed} tone="danger" hint="Past deadline" />
      </div>

      <Card className="mt-8 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No tasks yet — create one to get started.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-50-dark"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="font-medium text-zinc-900 hover:text-accent-600 dark:text-zinc-100 dark:hover:text-accent-500"
                    >
                      {task.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={TASK_STATUS_TONE[task.status]}>
                      {TASK_STATUS_LABEL[task.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{task.end_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

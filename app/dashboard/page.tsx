import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { getMyTasks, getMyCompletionStats, summarizeTasks, prioritizeTasks } from "@/lib/queries/my-tasks";
import { classifyUrgency, URGENCY_BADGE_TONE, URGENCY_LABEL } from "@/lib/urgency";
import { ClickableRow } from "@/components/ui/clickable-row";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [tasks, completion] = await Promise.all([
    getMyTasks(supabase, user.id),
    getMyCompletionStats(supabase, user.id),
  ]);
  const stats = summarizeTasks(tasks);
  const prioritized = prioritizeTasks(tasks);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            My Tasks
          </h1>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          <PlusIcon />
          New Task
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2.5 sm:grid-cols-8">
        <StatTile label="Due Today" value={stats.dueToday} tone="danger" size="sm" />
        <StatTile label="Overdue" value={stats.deadlineCrossed} tone="danger" size="sm" />
        <StatTile label="Open" value={stats.open} size="sm" />
        <StatTile label="In Progress" value={stats.inProgress} tone="progress" size="sm" />
        <StatTile label="Submitted" value={stats.submitted} tone="submitted" size="sm" />
        <StatTile label="Completed" value={stats.completed} tone="completed" size="sm" />
        <StatTile label="Done (Wk)" value={completion.thisWeek} tone="completed" size="sm" />
        <StatTile label="Done (Mo)" value={completion.thisMonth} tone="completed" size="sm" />
      </div>

      <Card className="mt-6 overflow-hidden">
        {prioritized.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No tasks yet — create one to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Created By</th>
                  <th className="px-5 py-3 font-medium">Start</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {prioritized.map((task) => {
                  const urgency = classifyUrgency(task.end_date, task.status);
                  return (
                    <ClickableRow
                      key={task.id}
                      href={`/dashboard/tasks/${task.id}`}
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
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                        {task.project ? task.project.name : "—"}
                      </td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{task.createdByName}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{task.start_date}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 dark:text-zinc-400">{task.end_date}</span>
                          {urgency !== "later" && urgency !== "done" && (
                            <Badge tone={URGENCY_BADGE_TONE[urgency]}>{URGENCY_LABEL[urgency]}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={TASK_STATUS_TONE[task.status]}>
                          {TASK_STATUS_LABEL[task.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/dashboard/tasks/${task.id}`}
                          aria-label={`Open ${task.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-surface-border text-zinc-500 transition-colors hover:bg-surface-100 hover:text-zinc-900 dark:border-surface-border-dark dark:text-zinc-400 dark:hover:bg-surface-50-dark dark:hover:text-zinc-100"
                        >
                          <PencilIcon />
                        </Link>
                      </td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M14.69 2.86a1.5 1.5 0 0 1 2.12 0l.33.33a1.5 1.5 0 0 1 0 2.12l-9.2 9.2-3.1.78.78-3.1 9.07-9.33Z" />
    </svg>
  );
}

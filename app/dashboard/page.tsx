import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/stat-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { getMyTasks, getMyCompletionStats, summarizeTasks, prioritizeTasks } from "@/lib/queries/my-tasks";
import { classifyUrgency, URGENCY_BADGE_TONE, URGENCY_LABEL } from "@/lib/urgency";

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
  const prioritized = prioritizeTasks(tasks).filter((t) => t.status !== "completed" && t.status !== "terminated");
  const doneRecently = tasks.filter((t) => t.status === "completed").slice(0, 5);

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
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            A snapshot of what&apos;s on your plate.
          </p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          <PlusIcon />
          New Task
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Due Today" value={stats.dueToday} tone="danger" hint="Deadline is today" />
        <StatTile label="Overdue" value={stats.deadlineCrossed} tone="danger" hint="Past deadline" />
        <StatTile label="In Progress" value={stats.inProgress} tone="progress" />
        <StatTile label="Submitted" value={stats.submitted} tone="submitted" hint="Awaiting review" />
        <StatTile label="Open" value={stats.open} />
        <StatTile label="Not Started" value={stats.notStarted} tone="danger" hint="Past start date" />
        <StatTile label="Completed (Week)" value={completion.thisWeek} tone="completed" />
        <StatTile label="Completed (Month)" value={completion.thisMonth} tone="completed" />
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 dark:border-surface-border-dark">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Prioritized queue</h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Overdue and due-soon tasks surface first.
            </p>
          </div>
        </div>
        {prioritized.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No tasks yet — create one to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {prioritized.map((task) => {
              const urgency = classifyUrgency(task.end_date, task.status);
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-50-dark"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="truncate font-medium text-zinc-900 hover:text-accent-600 dark:text-zinc-100 dark:hover:text-accent-500"
                      >
                        {task.name}
                      </Link>
                      {task.project && (
                        <Badge tone="accent">{task.project.name}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
                      Due {task.end_date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {urgency !== "later" && (
                      <Badge tone={URGENCY_BADGE_TONE[urgency]}>{URGENCY_LABEL[urgency]}</Badge>
                    )}
                    <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      aria-label={`Open ${task.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-border text-zinc-500 transition-colors hover:bg-surface-100 hover:text-zinc-900 dark:border-surface-border-dark dark:text-zinc-400 dark:hover:bg-surface-50-dark dark:hover:text-zinc-100"
                    >
                      <PencilIcon />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {doneRecently.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-surface-border px-5 py-4 dark:border-surface-border-dark">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recently completed</h2>
          </div>
          <ul className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {doneRecently.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className="truncate text-sm font-medium text-zinc-600 hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-500"
                >
                  {task.name}
                </Link>
                <Badge tone="success">Completed</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
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

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClickableRow } from "@/components/ui/clickable-row";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import type { TaskRow } from "@/lib/queries/analytics";
import Link from "next/link";

export function TaskTable({
  tasks,
  showProject = false,
  emptyLabel = "No tasks yet.",
}: {
  tasks: TaskRow[];
  showProject?: boolean;
  emptyLabel?: string;
}) {
  return (
    <Card className="overflow-hidden">
      {tasks.length === 0 ? (
        <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Task</th>
                {showProject && <th className="px-5 py-3 font-medium">Project</th>}
                <th className="px-5 py-3 font-medium">Created By</th>
                <th className="px-5 py-3 font-medium">Assignee(s)</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {tasks.map((task) => (
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
                  {showProject && (
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                      {task.projectName ?? "—"}
                    </td>
                  )}
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{task.createdByName}</td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {task.assigneeNames.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={TASK_STATUS_TONE[task.status as keyof typeof TASK_STATUS_TONE]}>
                      {TASK_STATUS_LABEL[task.status as keyof typeof TASK_STATUS_LABEL]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{task.end_date}</td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ProjectSummary } from "@/lib/queries/analytics";

export function ProjectSummaryCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block">
      <div className="h-full rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] dark:border-surface-border-dark dark:bg-surface-0-dark">
        <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {project.name}
        </h3>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Tasks</span>
            <span>
              {project.completedTasks}/{project.totalTasks}
            </span>
          </div>
          <div className="mt-1">
            <ProgressBar value={project.completedTasks} total={project.totalTasks} tone="success" />
          </div>
        </div>

        {project.overdueTasks > 0 && (
          <p className="mt-2.5 text-[11px] font-medium text-red-600 dark:text-red-400">
            {project.overdueTasks} overdue
          </p>
        )}
      </div>
    </Link>
  );
}

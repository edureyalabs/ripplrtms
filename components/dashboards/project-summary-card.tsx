import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/badge-tones";
import type { ProjectSummary } from "@/lib/queries/analytics";

export function ProjectSummaryCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block">
      <div className="h-full rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] dark:border-surface-border-dark dark:bg-surface-0-dark">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</h3>
          <Badge tone={PROJECT_STATUS_TONE[project.status as keyof typeof PROJECT_STATUS_TONE]}>
            {PROJECT_STATUS_LABEL[project.status as keyof typeof PROJECT_STATUS_LABEL]}
          </Badge>
        </div>

        {project.leadName && (
          <div className="mt-3 flex items-center gap-2">
            <Avatar name={project.leadName} avatarPath={project.leadAvatarPath} size="sm" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{project.leadName}</span>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Tasks</span>
            <span>
              {project.completedTasks} of {project.totalTasks}
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={project.completedTasks} total={project.totalTasks} tone="success" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600">
          <span>Due {project.deadline}</span>
          {project.overdueTasks > 0 && (
            <span className="font-medium text-red-600 dark:text-red-400">
              {project.overdueTasks} overdue
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

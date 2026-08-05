import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DepartmentRollup } from "@/lib/queries/dashboards";

export function DepartmentRollupCard({
  rollup,
  href,
}: {
  rollup: DepartmentRollup;
  href?: string;
}) {
  const totalOverdue = rollup.overdueNotStartedCount + rollup.overdueDeadlineCount;
  const totalTasks =
    rollup.openCount + rollup.inProgressCount + rollup.submittedCount + rollup.completedCount;

  const content = (
    <div className="rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-4 shadow-[var(--shadow-card)] transition-shadow dark:border-surface-border-dark dark:bg-surface-0-dark group-hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {rollup.departmentName}
        </h3>
        {totalOverdue > 0 && <Badge tone="danger">{totalOverdue} overdue</Badge>}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        {rollup.deptHeadId ? (
          <>
            <Avatar name={rollup.deptHeadName ?? ""} avatarPath={rollup.deptHeadAvatarPath} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {rollup.deptHeadName}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {rollup.memberCount} members
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No Dept Head · {rollup.memberCount} members
          </p>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>Completion</span>
          <span>
            {rollup.completedCount}/{totalTasks || 0}
          </span>
        </div>
        <div className="mt-1">
          <ProgressBar value={rollup.completedCount} total={totalTasks} tone="success" />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-4 gap-1 text-center">
        <div>
          <dt className="text-[10px] text-zinc-500 dark:text-zinc-400">Open</dt>
          <dd className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {rollup.openCount}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-zinc-500 dark:text-zinc-400">Active</dt>
          <dd className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {rollup.inProgressCount}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-zinc-500 dark:text-zinc-400">Sub</dt>
          <dd className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {rollup.submittedCount}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-zinc-500 dark:text-zinc-400">Done</dt>
          <dd className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {rollup.completedCount}
          </dd>
        </div>
      </dl>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group block">
      {content}
    </Link>
  );
}

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { DepartmentRollup } from "@/lib/queries/dashboards";

export function DepartmentRollupCard({ rollup }: { rollup: DepartmentRollup }) {
  const totalOverdue = rollup.overdueNotStartedCount + rollup.overdueDeadlineCount;

  return (
    <div className="rounded-[var(--radius-card)] border border-surface-border bg-surface-0 p-5 shadow-[var(--shadow-card)] dark:border-surface-border-dark dark:bg-surface-0-dark">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {rollup.departmentName}
        </h3>
        {totalOverdue > 0 && <Badge tone="danger">{totalOverdue} overdue</Badge>}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {rollup.deptHeadId ? (
          <>
            <Avatar name={rollup.deptHeadName ?? ""} avatarPath={rollup.deptHeadAvatarPath} size="sm" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {rollup.deptHeadName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dept Head · {rollup.memberCount} members
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No Dept Head assigned · {rollup.memberCount} members
          </p>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Open</dt>
          <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {rollup.openCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Active</dt>
          <dd className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {rollup.inProgressCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Submitted</dt>
          <dd className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {rollup.submittedCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Done</dt>
          <dd className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {rollup.completedCount}
          </dd>
        </div>
      </dl>
    </div>
  );
}

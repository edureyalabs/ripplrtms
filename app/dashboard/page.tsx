import { StatTile } from "@/components/ui/stat-tile";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
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

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Open" value={0} />
        <StatTile label="In Progress" value={0} tone="progress" />
        <StatTile label="Submitted" value={0} tone="submitted" />
        <StatTile label="Completed" value={0} tone="completed" />
        <StatTile label="Not Started" value={0} tone="danger" hint="Past start date" />
        <StatTile label="Overdue" value={0} tone="danger" hint="Past deadline" />
      </div>

      <Card className="mt-8">
        <div className="p-10 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Projects and tasks will appear here once they&apos;re built.
          </p>
        </div>
      </Card>
    </div>
  );
}

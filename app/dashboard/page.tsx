export default function DashboardPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
        Overview
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        My Tasks
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Projects and tasks will appear here once they&apos;re built.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Tasks, projects, and team views will appear here.
        </p>
      </div>
    </div>
  );
}

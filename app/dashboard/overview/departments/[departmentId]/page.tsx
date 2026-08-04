import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { getDepartmentTasks } from "@/lib/queries/analytics";

export default async function DepartmentTasksPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || (me.role !== "admin" && me.role !== "ceo")) {
    redirect("/dashboard/overview");
  }

  const { data: department } = await supabase
    .from("departments")
    .select("id, name")
    .eq("id", departmentId)
    .single();

  if (!department) notFound();

  const tasks = await getDepartmentTasks(supabase, departmentId);

  return (
    <div>
      <Link
        href="/dashboard/overview"
        className="text-xs font-medium text-zinc-500 hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-500"
      >
        ← Company Overview
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Department
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {department.name}
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Every task assigned to a member of this department.
      </p>

      <Card className="mt-8 overflow-hidden">
        {tasks.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No tasks for this department yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Assignee(s)</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {tasks.map((task) => (
                <tr key={task.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-50-dark">
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="font-medium text-zinc-900 hover:text-accent-600 dark:text-zinc-100 dark:hover:text-accent-500"
                    >
                      {task.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {task.projectName ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {task.assigneeNames.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={TASK_STATUS_TONE[task.status as keyof typeof TASK_STATUS_TONE]}>
                      {TASK_STATUS_LABEL[task.status as keyof typeof TASK_STATUS_LABEL]}
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

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskTable } from "@/components/tasks/task-table";
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

      <div className="mt-8">
        <TaskTable tasks={tasks} showProject emptyLabel="No tasks for this department yet." />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskTable } from "@/components/tasks/task-table";
import { Select } from "@/components/ui/form-field";
import { getAllTasks } from "@/lib/queries/analytics";
import { TASK_STATUS_LABEL } from "@/lib/badge-tones";
import { Constants } from "@/lib/types/database";

export default async function AllTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; project?: string; employee?: string; status?: string }>;
}) {
  const { department, project, employee, status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || (me.role !== "admin" && me.role !== "ceo")) {
    redirect("/dashboard/overview");
  }

  const [{ data: departments }, { data: projects }, { data: employees }, tasks] = await Promise.all([
    supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
    supabase.from("projects").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, email").not("role", "is", null).order("full_name"),
    getAllTasks(supabase, { departmentId: department, projectId: project, employeeId: employee, status }),
  ]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Command Center
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        All Tasks
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Every task across the company. Filter by department, project, employee, or status.
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Department</label>
          <Select name="department" defaultValue={department ?? ""} className="!py-1.5 text-sm">
            <option value="">All departments</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Project</label>
          <Select name="project" defaultValue={project ?? ""} className="!py-1.5 text-sm">
            <option value="">All projects</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Employee</label>
          <Select name="employee" defaultValue={employee ?? ""} className="!py-1.5 text-sm">
            <option value="">All employees</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name || e.email}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status</label>
          <Select name="status" defaultValue={status ?? ""} className="!py-1.5 text-sm">
            <option value="">All statuses</option>
            {Constants.public.Enums.task_status.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="flex h-9 items-center justify-center rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
        >
          Filter
        </button>
        {(department || project || employee || status) && (
          <a
            href="/dashboard/overview/tasks"
            className="text-sm font-medium text-zinc-500 hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-500"
          >
            Clear
          </a>
        )}
      </form>

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
        {tasks.length} task{tasks.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3">
        <TaskTable tasks={tasks} showProject emptyLabel="No tasks match these filters." />
      </div>
    </div>
  );
}

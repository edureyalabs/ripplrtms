import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/tasks/task-form";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: defaultProjectId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, department_id")
    .eq("id", user.id)
    .single();

  if (!me) redirect("/");

  const { data: projects } = await supabase.from("projects").select("id, name").order("name");

  if (me.role === "team_member") {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
          Tasks
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          New Task
        </h1>
        <TaskForm
          candidates={[]}
          fixedAssignee={me}
          projects={projects ?? []}
          defaultProjectId={defaultProjectId}
        />
      </div>
    );
  }

  let candidatesQuery = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .not("role", "is", null);

  if (me.role === "dept_head" && me.department_id) {
    candidatesQuery = candidatesQuery.eq("department_id", me.department_id);
  }

  const { data: candidates } = await candidatesQuery.order("full_name");

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Tasks
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Task
      </h1>
      <TaskForm
        candidates={candidates ?? []}
        projects={projects ?? []}
        defaultProjectId={defaultProjectId}
      />
    </div>
  );
}

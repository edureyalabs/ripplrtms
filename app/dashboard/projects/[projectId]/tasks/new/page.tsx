import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/tasks/task-form";

export default async function NewProjectTaskPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, start_date, deadline")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const { data: members } = await supabase
    .from("project_members")
    .select("profiles!project_members_user_id_fkey(id, full_name, email)")
    .eq("project_id", projectId);

  const candidates = (members ?? [])
    .map((m) => m.profiles)
    .filter((p): p is { id: string; full_name: string; email: string } => p !== null);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        {project.name}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Task
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Must fall within the project&apos;s window: {project.start_date} to {project.deadline}.
      </p>
      <TaskForm
        projectId={project.id}
        candidates={candidates}
        minDate={project.start_date}
        maxDate={project.deadline}
      />
    </div>
  );
}

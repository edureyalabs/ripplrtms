import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || (me.role !== "admin" && me.role !== "ceo" && me.role !== "dept_head")) {
    redirect("/dashboard/projects");
  }

  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .not("role", "is", null)
    .order("full_name");

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Projects
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Project
      </h1>

      <ProjectForm employees={employees ?? []} />
    </div>
  );
}

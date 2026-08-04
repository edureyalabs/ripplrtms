import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/badge-tones";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: me }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, start_date, deadline, lead:profiles!projects_lead_id_fkey(full_name, email, avatar_path)")
      .order("created_at", { ascending: false }),
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: null };
      return supabase.from("profiles").select("role").eq("id", user.id).single();
    })(),
  ]);

  const canCreate = me?.role === "admin" || me?.role === "ceo" || me?.role === "dept_head";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Projects
          </h1>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/projects/new"
            className="flex h-10 items-center justify-center rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600"
          >
            New Project
          </Link>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="mt-8">
          <div className="p-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No projects yet{canCreate ? " — create the first one." : "."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</h2>
                  <Badge tone={PROJECT_STATUS_TONE[project.status]}>
                    {PROJECT_STATUS_LABEL[project.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {project.start_date} → {project.deadline}
                </p>
                {project.lead && (
                  <div className="mt-4 flex items-center gap-2">
                    <Avatar
                      name={project.lead.full_name || project.lead.email}
                      avatarPath={project.lead.avatar_path}
                      size="sm"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {project.lead.full_name || project.lead.email}
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/badge-tones";
import { ProjectStatusButton } from "@/components/projects/status-button";
import { AddMemberForm, RemoveMemberButton } from "@/components/projects/member-actions";

export default async function ProjectDetailPage({
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

  const [{ data: project }, { data: members }, { data: me }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, name, description, status, start_date, deadline, lead_id, created_by, lead:profiles!projects_lead_id_fkey(full_name, email, avatar_path)"
      )
      .eq("id", projectId)
      .single(),
    supabase
      .from("project_members")
      .select("user_id, profiles!project_members_user_id_fkey(full_name, email, avatar_path, role)")
      .eq("project_id", projectId),
    supabase.from("profiles").select("id, role").eq("id", user.id).single(),
  ]);

  if (!project) {
    notFound();
  }

  const isCreator = project.created_by === user.id || me?.role === "admin" || me?.role === "ceo";
  const memberIds = new Set((members ?? []).map((m) => m.user_id));
  const isMember = memberIds.has(user.id) || isCreator;

  const { data: candidates } = isCreator
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("is_active", true)
        .not("role", "is", null)
    : { data: [] as { id: string; full_name: string; email: string }[] };

  const availableCandidates = (candidates ?? []).filter((c) => !memberIds.has(c.id));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Project
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {project.start_date} → {project.deadline}
          </p>
        </div>
        <Badge tone={PROJECT_STATUS_TONE[project.status]}>
          {PROJECT_STATUS_LABEL[project.status]}
        </Badge>
      </div>

      {project.description && (
        <p className="mt-4 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {project.status === "open" && isMember && (
          <ProjectStatusButton
            projectId={project.id}
            targetStatus="in_progress"
            label="Start Project"
            pendingLabel="Starting..."
          />
        )}
        {project.status === "in_progress" && isCreator && (
          <ProjectStatusButton
            projectId={project.id}
            targetStatus="completed"
            label="Mark Completed"
            pendingLabel="Completing..."
          />
        )}
        {project.status === "completed" && isCreator && (
          <ProjectStatusButton
            projectId={project.id}
            targetStatus="closed"
            label="Close Project"
            pendingLabel="Closing..."
            variant="outline"
          />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Activity" description="Tasks, updates, and chat are coming soon." />
          <CardBody>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This is where the project&apos;s tasks, phase progress, timeline, and chat will
              appear.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Members" />
          <CardBody className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {(members ?? []).map((member) => {
                const profile = member.profiles;
                if (!profile) return null;
                const isLead = member.user_id === project.lead_id;
                return (
                  <li key={member.user_id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        name={profile.full_name || profile.email}
                        avatarPath={profile.avatar_path}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {profile.full_name || profile.email}
                        </p>
                        {isLead && (
                          <p className="text-xs text-accent-600 dark:text-accent-500">Lead</p>
                        )}
                      </div>
                    </div>
                    {isCreator && !isLead && (
                      <RemoveMemberButton projectId={project.id} userId={member.user_id} />
                    )}
                  </li>
                );
              })}
            </ul>

            {isCreator && (
              <AddMemberForm projectId={project.id} candidates={availableCandidates} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

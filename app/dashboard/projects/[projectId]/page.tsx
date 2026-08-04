import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE, TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { ProjectStatusButton } from "@/components/projects/status-button";
import { AddMemberForm, RemoveMemberButton } from "@/components/projects/member-actions";
import { Stepper } from "@/components/ui/stepper";
import { SubmitPhasesForm } from "@/components/phases/submit-phases-form";
import { PhaseDecision } from "@/components/phases/phase-decision";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { UpdateForm } from "@/components/collaboration/update-form";
import { ChatPanel } from "@/components/collaboration/chat-panel";
import { getProjectTimeline } from "@/lib/queries/timeline";

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

  const [
    { data: project },
    { data: members },
    { data: me },
    { data: tasks },
    { data: phases },
    { data: messages },
    timeline,
  ] = await Promise.all([
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
    supabase
      .from("tasks")
      .select("id, name, status, end_date")
      .eq("project_id", projectId)
      .order("end_date"),
    supabase
      .from("project_phases")
      .select("id, name, status")
      .eq("project_id", projectId)
      .order("position"),
    supabase
      .from("project_messages")
      .select(
        "id, body, created_at, sender:profiles!project_messages_sender_id_fkey(full_name, email, avatar_path)"
      )
      .eq("project_id", projectId)
      .order("created_at"),
    getProjectTimeline(supabase, projectId),
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

  const chatMessages = (messages ?? []).map((m) => ({
    id: m.id,
    body: m.body,
    created_at: m.created_at,
    senderName: m.sender ? m.sender.full_name || m.sender.email : "Someone",
    senderAvatarPath: m.sender?.avatar_path ?? null,
  }));

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
          <CardHeader
            title="Tasks"
            description="Phase progress, timeline, and chat are coming soon."
            action={
              isMember && (
                <Link
                  href={`/dashboard/projects/${project.id}/tasks/new`}
                  className="flex h-8 items-center justify-center rounded-md border border-surface-border px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-surface-50 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
                >
                  New Task
                </Link>
              )
            }
          />
          <CardBody>
            {!tasks || tasks.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border dark:divide-surface-border-dark">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="truncate text-sm font-medium text-zinc-900 hover:text-accent-600 dark:text-zinc-100 dark:hover:text-accent-500"
                    >
                      {task.name}
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        {task.end_date}
                      </span>
                      <Badge tone={TASK_STATUS_TONE[task.status]}>
                        {TASK_STATUS_LABEL[task.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Phases" description="Independent of sub-task status." />
          <CardBody>
            {!phases || phases.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No phases defined.</p>
            ) : (
              <>
                <Stepper phases={phases} />
                {isMember &&
                  project.status !== "closed" && (
                    <SubmitPhasesForm
                      parentType="project"
                      parentId={project.id}
                      pendingPhases={phases.filter((p) => p.status === "pending")}
                    />
                  )}
                {isCreator && (
                  <div className="mt-3 flex flex-col gap-2">
                    {phases
                      .filter((p) => p.status === "submitted")
                      .map((phase) => (
                        <PhaseDecision
                          key={phase.id}
                          parentType="project"
                          parentId={project.id}
                          phaseId={phase.id}
                          phaseName={phase.name}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
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

      <Card className="mt-6">
        <CardHeader
          title="Activity"
          description={project.status === "closed" ? "Locked — this project is closed." : undefined}
        />
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "timeline",
                label: "Timeline",
                content: (
                  <div className="flex flex-col gap-4">
                    {isMember && project.status !== "closed" && (
                      <UpdateForm parentType="project" parentId={project.id} />
                    )}
                    <Timeline entries={timeline} />
                  </div>
                ),
              },
              {
                key: "chat",
                label: "Chat",
                content: (
                  <ChatPanel parentType="project" parentId={project.id} messages={chatMessages} />
                ),
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}

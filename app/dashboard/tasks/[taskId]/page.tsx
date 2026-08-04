import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { TaskStatusButton, TaskRejectControl } from "@/components/tasks/task-status-controls";
import { Stepper } from "@/components/ui/stepper";
import { SubmitPhasesForm } from "@/components/phases/submit-phases-form";
import { PhaseDecision } from "@/components/phases/phase-decision";
import { UpdateForm } from "@/components/collaboration/update-form";
import { ChatPanel } from "@/components/collaboration/chat-panel";
import { getTaskTimeline } from "@/lib/queries/timeline";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: task }, { data: members }, { data: phases }, { data: messages }, timeline] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, name, description, status, start_date, end_date, created_by, project_id, projects(name)"
        )
        .eq("id", taskId)
        .single(),
      supabase
        .from("task_members")
        .select("user_id, role, profiles!task_members_user_id_fkey(full_name, email, avatar_path)")
        .eq("task_id", taskId),
      supabase.from("task_phases").select("id, name, status").eq("task_id", taskId).order("position"),
      supabase
        .from("task_messages")
        .select("id, body, created_at, sender:profiles!task_messages_sender_id_fkey(full_name, email, avatar_path)")
        .eq("task_id", taskId)
        .order("created_at"),
      getTaskTimeline(supabase, taskId),
    ]);

  if (!task) {
    notFound();
  }

  const isAssignee = (members ?? []).some((m) => m.user_id === user.id && m.role === "assignee");
  const isCreator = task.created_by === user.id;
  const isLocked = task.status === "completed" || task.status === "terminated";

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
          {task.projects && (
            <Link
              href={`/dashboard/projects/${task.project_id}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 hover:underline dark:text-accent-500"
            >
              {task.projects.name}
            </Link>
          )}
          {!task.projects && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
              Task
            </p>
          )}
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {task.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {task.start_date} → {task.end_date}
          </p>
        </div>
        <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
      </div>

      {task.description && (
        <p className="mt-4 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          {task.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {task.status === "open" && isAssignee && (
          <TaskStatusButton
            taskId={task.id}
            targetStatus="in_progress"
            label="Start Task"
            pendingLabel="Starting..."
          />
        )}
        {task.status === "in_progress" && isAssignee && (
          <TaskStatusButton
            taskId={task.id}
            targetStatus="submitted"
            label="Submit for Completion"
            pendingLabel="Submitting..."
          />
        )}
        {task.status === "submitted" && isCreator && (
          <>
            <TaskStatusButton
              taskId={task.id}
              targetStatus="completed"
              label="Accept"
              pendingLabel="Accepting..."
            />
            <TaskRejectControl taskId={task.id} />
          </>
        )}
        {isAssignee && !isLocked && (
          <TaskStatusButton
            taskId={task.id}
            targetStatus="terminated"
            label="Terminate"
            pendingLabel="Terminating..."
            variant="danger"
          />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Activity"
            description={isLocked ? "Locked — this task is finished." : undefined}
          />
          <CardBody>
            <Tabs
              tabs={[
                {
                  key: "timeline",
                  label: "Timeline",
                  content: (
                    <div className="flex flex-col gap-4">
                      {isAssignee && !isLocked && (
                        <UpdateForm parentType="task" parentId={task.id} />
                      )}
                      <Timeline entries={timeline} />
                    </div>
                  ),
                },
                {
                  key: "chat",
                  label: "Chat",
                  content: (
                    <ChatPanel parentType="task" parentId={task.id} messages={chatMessages} />
                  ),
                },
              ]}
            />
          </CardBody>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Phases" />
            <CardBody>
              {!phases || phases.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No phases defined.</p>
              ) : (
                <>
                  <Stepper phases={phases} />
                  {isAssignee && !isLocked && (
                    <SubmitPhasesForm
                      parentType="task"
                      parentId={task.id}
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
                            parentType="task"
                            parentId={task.id}
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
            <CardBody>
              <ul className="flex flex-col gap-3">
                {(members ?? []).map((member) => {
                  const profile = member.profiles;
                  if (!profile) return null;
                  return (
                    <li key={member.user_id} className="flex items-center gap-2">
                      <Avatar
                        name={profile.full_name || profile.email}
                        avatarPath={profile.avatar_path}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {profile.full_name || profile.email}
                        </p>
                        <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                          {member.role}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

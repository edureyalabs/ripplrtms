import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { classifyUrgency, URGENCY_BADGE_TONE, URGENCY_LABEL } from "@/lib/urgency";
import { TaskStatusButton, TaskRejectControl } from "@/components/tasks/task-status-controls";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { TaskUpdateModal } from "@/components/tasks/task-update-modal";
import { PhaseDecision } from "@/components/phases/phase-decision";
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
          "id, name, description, status, start_date, end_date, created_at, created_by, project_id, projects(id, name), creator:profiles!tasks_created_by_fkey(full_name, email)"
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
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isPrivileged = me?.role === "admin" || me?.role === "ceo";
  const canEdit = isCreator || isPrivileged;
  const isLocked = task.status === "completed" || task.status === "terminated";
  const urgency = classifyUrgency(task.end_date, task.status);

  const pendingPhases = (phases ?? []).filter((p) => p.status === "pending");
  const submittedPhases = (phases ?? []).filter((p) => p.status === "submitted");
  const hasPhaseAwaitingReview = submittedPhases.length > 0;
  const canPostUpdate =
    isAssignee && (task.status === "open" || task.status === "in_progress") && !hasPhaseAwaitingReview;

  const chatMessages = (messages ?? []).map((m) => ({
    id: m.id,
    body: m.body,
    created_at: m.created_at,
    senderName: m.sender ? m.sender.full_name || m.sender.email : "Someone",
    senderAvatarPath: m.sender?.avatar_path ?? null,
  }));

  const assignees = (members ?? []).filter((m) => m.role === "assignee");

  const createdEntry: TimelineEntry = {
    id: "task-created",
    kind: "task_created",
    actorName: task.creator ? task.creator.full_name || task.creator.email : "Someone",
    createdAt: task.created_at,
  };
  const entries = [createdEntry, ...timeline];

  return (
    <div>
      {/* Header strip */}
      <Card className="p-5">
        <Link
          href={task.projects ? `/dashboard/projects/${task.projects.id}` : "/dashboard"}
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-500"
        >
          <BackIcon />
          {task.projects ? task.projects.name : "My Tasks"}
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {task.name}
              </h1>
              {task.projects && <Badge tone="accent">{task.projects.name}</Badge>}
              <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
              {urgency !== "done" && urgency !== "later" && (
                <Badge tone={URGENCY_BADGE_TONE[urgency]}>{URGENCY_LABEL[urgency]}</Badge>
              )}
            </div>
            {task.description && (
              <p className="mt-1.5 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                {task.description}
              </p>
            )}
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-600">
              {task.start_date} → {task.end_date}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {assignees.length > 0 && (
              <div className="flex -space-x-2">
                {assignees.map((m) =>
                  m.profiles ? (
                    <div key={m.user_id} className="ring-2 ring-background rounded-full">
                      <Avatar
                        name={m.profiles.full_name || m.profiles.email}
                        avatarPath={m.profiles.avatar_path}
                        size="md"
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}
            {canEdit && (
              <EditTaskDialog
                taskId={task.id}
                name={task.name}
                description={task.description}
                startDate={task.start_date}
                endDate={task.end_date}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Action toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canPostUpdate && (
          <TaskUpdateModal
            taskId={task.id}
            pendingPhases={pendingPhases}
            willStartTask={task.status === "open"}
          />
        )}
        {task.status === "in_progress" && isAssignee && !hasPhaseAwaitingReview && (
          <TaskStatusButton
            taskId={task.id}
            targetStatus="submitted"
            label="Submit for Completion"
            pendingLabel="Submitting..."
            variant="outline"
          />
        )}
        {task.status === "submitted" && isCreator && (
          <>
            <TaskStatusButton
              taskId={task.id}
              targetStatus="completed"
              label="Approve & Close"
              pendingLabel="Approving..."
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
        {hasPhaseAwaitingReview && !isCreator && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {submittedPhases.length === 1 ? "A phase is" : `${submittedPhases.length} phases are`} awaiting
            review — updates are paused until then.
          </p>
        )}
      </div>

      {isCreator &&
        submittedPhases.map((phase) => (
          <div key={phase.id} className="mt-3">
            <PhaseDecision
              parentType="task"
              parentId={task.id}
              phaseId={phase.id}
              phaseName={phase.name}
            />
          </div>
        ))}

      {/* Main split: activity log (left, ~70%) / chat (right, ~30%) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-10">
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader
            title="Activity log"
            description={isLocked ? "Locked — this task is finished." : undefined}
          />
          <CardBody>
            <Timeline entries={entries} />
          </CardBody>
        </Card>

        <Card className="flex h-[36rem] flex-col overflow-hidden lg:col-span-3 lg:h-auto">
          <CardHeader
            title="Chat"
            description={`${chatMessages.length} message${chatMessages.length === 1 ? "" : "s"}`}
          />
          <div className="min-h-0 flex-1">
            <ChatPanel parentType="task" parentId={task.id} messages={chatMessages} />
          </div>
        </Card>
      </div>

      {/* Members */}
      {(members ?? []).length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Members" />
          <CardBody>
            <ul className="flex flex-wrap gap-4">
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
      )}
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.7 15.7a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 1 1 1.4 1.4L8.42 10l4.3 4.3a1 1 0 0 1 0 1.4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

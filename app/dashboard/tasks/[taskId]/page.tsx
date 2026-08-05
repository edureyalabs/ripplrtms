import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE } from "@/lib/badge-tones";
import { classifyUrgency, URGENCY_BADGE_TONE, URGENCY_LABEL } from "@/lib/urgency";
import { TaskStatusButton, TaskRejectControl } from "@/components/tasks/task-status-controls";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskUpdateModal } from "@/components/tasks/task-update-modal";
import { TaskReviewModal } from "@/components/tasks/task-review-modal";
import { PhaseDecision } from "@/components/phases/phase-decision";
import { ChatPanel } from "@/components/collaboration/chat-panel";
import { getTaskTimeline } from "@/lib/queries/timeline";
import { getLatestTaskMessages } from "@/lib/actions/messages";

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

  const [{ data: task }, { data: members }, { data: phases }, chatMessages, timeline] =
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
      getLatestTaskMessages(taskId),
      getTaskTimeline(supabase, taskId),
    ]);

  if (!task) {
    notFound();
  }

  const isAssignee = (members ?? []).some((m) => m.user_id === user.id && m.role === "assignee");
  const isCollaborator = (members ?? []).some((m) => m.user_id === user.id && m.role === "collaborator");
  const isCreator = task.created_by === user.id;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isPrivileged = me?.role === "admin" || me?.role === "ceo";
  const canEdit = isCreator || isPrivileged;
  const canReview = isCreator || isCollaborator || isPrivileged;
  const isLocked = task.status === "completed" || task.status === "terminated";
  const urgency = classifyUrgency(task.end_date, task.status);

  const pendingPhases = (phases ?? []).filter((p) => p.status === "pending");
  const submittedPhases = (phases ?? []).filter((p) => p.status === "submitted");
  const hasPhaseAwaitingReview = submittedPhases.length > 0;
  const canPostUpdate =
    (isAssignee || isCreator || isPrivileged) &&
    (task.status === "open" || task.status === "in_progress") &&
    !hasPhaseAwaitingReview;

  const createdEntry: TimelineEntry = {
    id: "task-created",
    kind: "task_created",
    actorName: task.creator ? task.creator.full_name || task.creator.email : "Someone",
    createdAt: task.created_at,
  };
  const entries = [createdEntry, ...timeline];

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col">
      {/* Header strip: identity + members, kept compact */}
      <Card className="shrink-0 p-5">
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

          <div className="flex shrink-0 items-center gap-2">
            {canEdit && (
              <EditTaskDialog
                taskId={task.id}
                name={task.name}
                description={task.description}
                startDate={task.start_date}
                endDate={task.end_date}
              />
            )}
            {isPrivileged && <DeleteTaskButton taskId={task.id} />}
          </div>
        </div>

        {(members ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-surface-border pt-3 dark:border-surface-border-dark">
            {(members ?? []).map((member) => {
              const profile = member.profiles;
              if (!profile) return null;
              return (
                <div key={member.user_id} className="flex items-center gap-1.5">
                  <Avatar
                    name={profile.full_name || profile.email}
                    avatarPath={profile.avatar_path}
                    size="sm"
                  />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {profile.full_name || profile.email}
                  </span>
                  <span className="text-[10px] capitalize text-zinc-400 dark:text-zinc-600">
                    {member.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Action toolbar */}
      <div className="mt-4 flex shrink-0 flex-wrap items-center gap-3">
        {canPostUpdate && (
          <TaskUpdateModal
            taskId={task.id}
            pendingPhases={isAssignee ? pendingPhases : []}
            willStartTask={task.status === "open" && isAssignee}
          />
        )}
        {canReview && !isLocked && <TaskReviewModal taskId={task.id} />}
        {task.status === "in_progress" && (isAssignee || isPrivileged) && !hasPhaseAwaitingReview && (
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
        {isCreator && !isLocked && (
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
          <div key={phase.id} className="mt-3 shrink-0">
            <PhaseDecision taskId={task.id} phaseId={phase.id} phaseName={phase.name} />
          </div>
        ))}

      {/* Main split: activity log (left, ~70%) / chat (right, ~30%), both filling remaining height */}
      <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-10">
        <Card className="flex min-h-0 flex-col lg:col-span-7">
          <CardHeader
            title="Activity log"
            description={isLocked ? "Locked — this task is finished." : undefined}
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <Timeline entries={entries} />
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col lg:col-span-3">
          <CardHeader
            title="Chat"
            description={`${chatMessages.length} message${chatMessages.length === 1 ? "" : "s"}`}
          />
          <div className="min-h-0 flex-1">
            <ChatPanel taskId={task.id} initialMessages={chatMessages} />
          </div>
        </Card>
      </div>
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

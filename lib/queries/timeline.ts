import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { TimelineEntry } from "@/components/ui/timeline";

function actorName(profile: { full_name: string; email: string } | null) {
  return profile ? profile.full_name || profile.email : "Someone";
}

export async function getTaskTimeline(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<TimelineEntry[]> {
  const [{ data: events }, { data: updates }] = await Promise.all([
    supabase
      .from("task_events")
      .select(
        "id, kind, from_status, to_status, reason, created_at, actor:profiles!task_events_actor_id_fkey(full_name, email), phase:task_phases(name)"
      )
      .eq("task_id", taskId)
      .order("created_at"),
    supabase
      .from("task_updates")
      .select(
        "id, body, created_at, author:profiles!task_updates_author_id_fkey(full_name, email), task_update_attachments(id, file_name, file_path)"
      )
      .eq("task_id", taskId)
      .order("created_at"),
  ]);

  const eventEntries: TimelineEntry[] = (events ?? []).map((e) => ({
    id: e.id,
    kind: e.kind as TimelineEntry["kind"],
    actorName: actorName(e.actor),
    fromStatus: e.from_status,
    toStatus: e.to_status,
    phaseName: e.phase?.name ?? null,
    reason: e.reason,
    createdAt: e.created_at,
  }));

  const updateEntries: TimelineEntry[] = await Promise.all(
    (updates ?? []).map(async (u) => {
      const attachments = await Promise.all(
        (u.task_update_attachments ?? []).map(async (att) => {
          const { data } = await supabase.storage
            .from("attachments")
            .createSignedUrl(att.file_path, 3600);
          return { id: att.id, fileName: att.file_name, url: data?.signedUrl ?? "#" };
        })
      );
      return {
        id: u.id,
        kind: "manual_update" as const,
        actorName: actorName(u.author),
        body: u.body,
        attachments,
        createdAt: u.created_at,
      };
    })
  );

  return [...eventEntries, ...updateEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getProjectTimeline(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<TimelineEntry[]> {
  const [{ data: events }, { data: updates }] = await Promise.all([
    supabase
      .from("project_events")
      .select(
        "id, kind, from_status, to_status, reason, created_at, actor:profiles!project_events_actor_id_fkey(full_name, email), phase:project_phases(name)"
      )
      .eq("project_id", projectId)
      .order("created_at"),
    supabase
      .from("project_updates")
      .select(
        "id, body, created_at, author:profiles!project_updates_author_id_fkey(full_name, email), project_update_attachments(id, file_name, file_path)"
      )
      .eq("project_id", projectId)
      .order("created_at"),
  ]);

  const eventEntries: TimelineEntry[] = (events ?? []).map((e) => ({
    id: e.id,
    kind: e.kind as TimelineEntry["kind"],
    actorName: actorName(e.actor),
    fromStatus: e.from_status,
    toStatus: e.to_status,
    phaseName: e.phase?.name ?? null,
    reason: e.reason,
    createdAt: e.created_at,
  }));

  const updateEntries: TimelineEntry[] = await Promise.all(
    (updates ?? []).map(async (u) => {
      const attachments = await Promise.all(
        (u.project_update_attachments ?? []).map(async (att) => {
          const { data } = await supabase.storage
            .from("attachments")
            .createSignedUrl(att.file_path, 3600);
          return { id: att.id, fileName: att.file_name, url: data?.signedUrl ?? "#" };
        })
      );
      return {
        id: u.id,
        kind: "manual_update" as const,
        actorName: actorName(u.author),
        body: u.body,
        attachments,
        createdAt: u.created_at,
      };
    })
  );

  return [...eventEntries, ...updateEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

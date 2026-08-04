"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";
import { parsePhaseNames } from "@/lib/phase-names";
import type { Enums } from "@/lib/types/database";

export type ProjectState = { error?: string } | undefined;

export async function createProject(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const leadId = String(formData.get("lead_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const memberIds = formData.getAll("member_ids").map(String);

  if (!name || !leadId || !startDate || !deadline) {
    return { error: "Name, lead, start date, and deadline are required." };
  }
  if (deadline < startDate) {
    return { error: "Deadline must be on or after the start date." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (startDate < today) {
    return { error: "Start date can't be in the past." };
  }

  let newProjectId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("role, department_id")
      .eq("id", user.id)
      .single();

    if (!me || (me.role !== "admin" && me.role !== "ceo" && me.role !== "dept_head")) {
      return { error: "Only Admin, CEO, or Dept Head can create projects." };
    }

    if (me.role === "dept_head") {
      const { data: lead } = await supabase
        .from("profiles")
        .select("department_id")
        .eq("id", leadId)
        .single();
      if (!lead || lead.department_id !== me.department_id) {
        return { error: "As a Dept Head, the project lead must be from your own department." };
      }
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description: description || null,
        lead_id: leadId,
        start_date: startDate,
        deadline,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      throw new Error(projectError?.message ?? "Could not create the project.");
    }

    const extraMembers = memberIds.filter((id) => id && id !== leadId);
    if (extraMembers.length > 0) {
      const { error: membersError } = await supabase.from("project_members").upsert(
        extraMembers.map((userId) => ({
          project_id: project.id,
          user_id: userId,
          added_by: user.id,
        })),
        { onConflict: "project_id,user_id", ignoreDuplicates: true }
      );
      if (membersError) {
        throw new Error(membersError.message);
      }
    }

    const phaseNames = parsePhaseNames(String(formData.get("phases") ?? ""));
    if (phaseNames.length > 0) {
      const { error: phasesError } = await supabase.from("project_phases").insert(
        phaseNames.map((phaseName, index) => ({
          project_id: project.id,
          name: phaseName,
          position: index,
        }))
      );
      if (phasesError) {
        throw new Error(phasesError.message);
      }
    }

    newProjectId = project.id;
  } catch (err) {
    return { error: getErrorMessage(err, "Could not create the project.") };
  }

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${newProjectId}`);
}

export async function updateProjectStatus(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Enums<"project_status">;

  if (!id || !status) {
    return { error: "Missing project or status." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not update the project status.") };
  }

  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath("/dashboard/projects");
}

export async function addProjectMember(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const projectId = String(formData.get("project_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");

  if (!projectId || !userId) {
    return { error: "Choose someone to add." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase
      .from("project_members")
      .upsert(
        { project_id: projectId, user_id: userId, added_by: user.id },
        { onConflict: "project_id,user_id", ignoreDuplicates: true }
      );
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not add that member.") };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function removeProjectMember(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const projectId = String(formData.get("project_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");

  if (!projectId || !userId) {
    return { error: "Missing member." };
  }

  try {
    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects")
      .select("lead_id")
      .eq("id", projectId)
      .single();

    if (project?.lead_id === userId) {
      return { error: "Change the project lead instead of removing them." };
    }

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not remove that member.") };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
}

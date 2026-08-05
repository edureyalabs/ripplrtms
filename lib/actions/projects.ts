"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type ProjectState = { error?: string } | undefined;

export async function deleteProject(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing project." };

  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);
    if (count && count > 0) {
      return {
        error: `This project still has ${count} task${count === 1 ? "" : "s"}. Delete them first.`,
      };
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { error: getErrorMessage(err, "Could not delete the project.") };
  }

  revalidatePath("/dashboard/overview");
  redirect("/dashboard/overview");
}

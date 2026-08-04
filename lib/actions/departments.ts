"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DepartmentState = { error?: string } | undefined;

export async function createDepartment(
  _prevState: DepartmentState,
  formData: FormData
): Promise<DepartmentState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Department name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("departments").insert({
    name,
    description: description || null,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "A department with this name already exists." : error.message,
    };
  }

  revalidatePath("/dashboard/admin/departments");
  redirect("/dashboard/admin/departments");
}

export async function updateDepartment(
  _prevState: DepartmentState,
  formData: FormData
): Promise<DepartmentState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!id || !name) {
    return { error: "Department name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ name, description: description || null, is_active: isActive })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505" ? "A department with this name already exists." : error.message,
    };
  }

  revalidatePath("/dashboard/admin/departments");
  redirect("/dashboard/admin/departments");
}

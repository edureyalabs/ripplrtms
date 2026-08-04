"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminActionState = { error?: string } | undefined;

export async function promoteToAdmin(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) {
    return { error: "Missing user." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", department_id: null })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/employees");
}

export async function demoteAdmin(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");
  const departmentId = String(formData.get("department_id") ?? "");

  if (!userId || (role !== "dept_head" && role !== "team_member")) {
    return { error: "Choose Dept Head or Team Member." };
  }
  if (!departmentId) {
    return { error: "Department is required for this role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, department_id: departmentId })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/employees");
}

export async function setCeo(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) {
    return { error: "Missing user." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_ceo", { new_ceo_id: userId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/employees");
}

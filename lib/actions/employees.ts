"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/types/database";

export type EmployeeState = { error?: string } | undefined;

const AVATAR_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

async function uploadAvatar(userId: string, avatar: File) {
  const ext = AVATAR_MIME_TO_EXT[avatar.type];
  if (!ext) {
    throw new Error("Avatar must be a PNG, JPEG, or WebP image.");
  }
  if (avatar.size > 5 * 1024 * 1024) {
    throw new Error("Avatar must be 5MB or smaller.");
  }

  const admin = createAdminClient();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await admin.storage.from("avatars").upload(path, avatar, {
    upsert: true,
    contentType: avatar.type,
  });

  if (error) {
    throw new Error(`Avatar upload failed: ${error.message}`);
  }

  return path;
}

export async function createEmployee(
  _prevState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Enums<"user_role">;
  const departmentId = String(formData.get("department_id") ?? "");
  const avatar = formData.get("avatar");

  if (!fullName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (role !== "dept_head" && role !== "team_member") {
    return { error: "Role must be Dept Head or Team Member." };
  }
  if (!departmentId) {
    return { error: "Department is required for this role." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account." };
  }

  const userId = created.user.id;

  try {
    let avatarPath: string | null = null;
    if (avatar instanceof File && avatar.size > 0) {
      avatarPath = await uploadAvatar(userId, avatar);
    }

    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        department_id: departmentId,
        avatar_path: avatarPath,
      })
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }
  } catch (err) {
    // Roll back the auth user so we don't leave an orphaned, half-set-up login.
    await admin.auth.admin.deleteUser(userId);
    return {
      error: err instanceof Error ? err.message : "Could not finish creating the employee.",
    };
  }

  revalidatePath("/dashboard/admin/employees");
  redirect("/dashboard/admin/employees");
}

export async function updateEmployee(
  _prevState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Enums<"user_role">;
  const departmentId = String(formData.get("department_id") ?? "");
  const isActive = formData.get("is_active") === "on";
  const avatar = formData.get("avatar");

  if (!id || !fullName) {
    return { error: "Name is required." };
  }
  if (role !== "dept_head" && role !== "team_member") {
    return { error: "Role must be Dept Head or Team Member." };
  }
  if (!departmentId) {
    return { error: "Department is required for this role." };
  }

  try {
    let avatarPath: string | undefined;
    if (avatar instanceof File && avatar.size > 0) {
      avatarPath = await uploadAvatar(id, avatar);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        department_id: departmentId,
        is_active: isActive,
        ...(avatarPath ? { avatar_path: avatarPath } : {}),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update the employee.",
    };
  }

  revalidatePath("/dashboard/admin/employees");
  redirect("/dashboard/admin/employees");
}

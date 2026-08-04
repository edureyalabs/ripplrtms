"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/error-message";
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

// Creates a bare login (name, email, password, optional avatar). Role and
// department are tagged afterward on the employee's own page — see
// assignRole below — so this step never has to satisfy the
// role/department CHECK constraint.
export async function createEmployee(
  _prevState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const avatar = formData.get("avatar");

  if (!fullName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let userId: string;

  try {
    const admin = createAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !created.user) {
      return { error: getErrorMessage(createError, "Could not create the account.") };
    }
    userId = created.user.id;
  } catch (err) {
    return { error: getErrorMessage(err, "Could not create the account.") };
  }

  try {
    let avatarPath: string | null = null;
    if (avatar instanceof File && avatar.size > 0) {
      avatarPath = await uploadAvatar(userId, avatar);
    }

    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_path: avatarPath })
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }
  } catch (err) {
    // Roll back the auth user so we don't leave an orphaned login behind.
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
    return { error: getErrorMessage(err, "Could not finish creating the employee.") };
  }

  revalidatePath("/dashboard/admin/employees");
  redirect(`/dashboard/admin/employees/${userId}`);
}

// The single place role, department, name, avatar, and active status get
// tagged for an existing login — covers Admin/Dept Head/Team Member (CEO is
// set separately via setCeo in admins.ts, a singleton swap).
export async function assignRole(
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
  if (role !== "admin" && role !== "dept_head" && role !== "team_member") {
    return { error: "Choose Admin, Dept Head, or Team Member." };
  }
  const needsDepartment = role === "dept_head" || role === "team_member";
  if (needsDepartment && !departmentId) {
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
        department_id: needsDepartment ? departmentId : null,
        is_active: isActive,
        ...(avatarPath ? { avatar_path: avatarPath } : {}),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not update the employee.") };
  }

  revalidatePath("/dashboard/admin/employees");
  revalidatePath(`/dashboard/admin/employees/${id}`);
  redirect("/dashboard/admin/employees");
}

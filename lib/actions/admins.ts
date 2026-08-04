"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/error-message";

export type AdminActionState = { error?: string } | undefined;

// CEO is a singleton, so it's set via this RPC (see set_ceo() migration)
// rather than through the regular role dropdown on assignRole — the
// function atomically demotes any existing CEO to Admin in the same
// transaction as promoting the new one.
export async function setCeo(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) {
    return { error: "Missing user." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_ceo", { new_ceo_id: userId });
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: getErrorMessage(err, "Could not set CEO.") };
  }

  revalidatePath("/dashboard/admin/employees");
  revalidatePath(`/dashboard/admin/employees/${userId}`);
}

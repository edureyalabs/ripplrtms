import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/sidebar/sidebar-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, avatar_path")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  return <SidebarShell profile={profile}>{children}</SidebarShell>;
}

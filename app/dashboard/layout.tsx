import type { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/sidebar/sidebar-shell";
import { SubmitButton } from "@/components/submit-button";

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

  if (!profile.role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <Image src="/logo.jpg" alt="Ripplr" width={800} height={200} className="h-8 w-auto" />
        <h1 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Your account is being set up
        </h1>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          An admin still needs to assign your role and department. Check back shortly, or reach
          out to your admin.
        </p>
        <form action="/api/auth/signout" method="post" className="mt-2">
          <SubmitButton
            pendingLabel="Logging out..."
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Log out
          </SubmitButton>
        </form>
      </div>
    );
  }

  return <SidebarShell profile={{ ...profile, role: profile.role }}>{children}</SidebarShell>;
}

import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/submit-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-[#0b2340] dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Ripplr"
              width={800}
              height={200}
              priority
              className="h-6 w-auto rounded-sm"
            />
            <span className="hidden text-sm font-medium text-slate-300 sm:inline">
              Task Management Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-300 sm:inline">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="post">
              <SubmitButton
                pendingLabel="Logging out..."
                className="flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Log out
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Signed in as {user.email}. Your workspace is being set up.
        </p>

        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tasks, projects, and team views will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

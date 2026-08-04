import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Logged in as {user.email}
        </p>

        <form action="/api/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="flex h-10 items-center justify-center rounded-full border border-black/[.08] px-5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

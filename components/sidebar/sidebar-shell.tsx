"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/submit-button";
import { logout } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { navItemsForRole } from "@/components/sidebar/nav-items";
import type { Enums } from "@/lib/types/database";

type Profile = {
  full_name: string;
  email: string;
  role: Enums<"user_role">;
  avatar_path: string | null;
};

export function SidebarShell({
  profile,
  children,
}: {
  profile: Profile;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const items = navItemsForRole(profile.role);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-brand-900 px-4 py-3 lg:hidden">
        <Image src="/logo.jpg" alt="Ripplr" width={800} height={200} className="h-8 w-auto" />
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white"
        >
          Menu
        </button>
      </div>

      <aside
        className={`${mobileOpen ? "flex" : "hidden"} fixed inset-0 top-[49px] z-20 w-full flex-col bg-brand-900 px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-56 lg:shrink-0`}
      >
        <Image
          src="/logo.jpg"
          alt="Ripplr"
          width={800}
          height={200}
          priority
          className="hidden h-11 w-auto py-1 lg:block"
        />

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-1">
            <Avatar name={profile.full_name || profile.email} avatarPath={profile.avatar_path} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-slate-400">{ROLE_LABELS[profile.role]}</p>
            </div>
          </div>
          <form action={logout} className="mt-4">
            <SubmitButton
              pendingLabel="Logging out..."
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Log out
            </SubmitButton>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}

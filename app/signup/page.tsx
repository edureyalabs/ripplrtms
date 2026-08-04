"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthState } from "@/lib/actions/auth";
import { AuthBrandPanel } from "@/components/auth-brand-panel";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    undefined
  );

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-zinc-950">
      <AuthBrandPanel />

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/4 lg:min-w-[420px] lg:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Image
            src="/logo.jpg"
            alt="Ripplr"
            width={800}
            height={200}
            className="h-8 w-auto lg:hidden"
          />

          <div className="mt-8 lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Ripplr Task Management Portal
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              Register with your company email to request portal access.
            </p>
          </div>

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@ripplr.com"
                required
                className="rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition-colors focus:border-[#0b2340] focus:ring-1 focus:ring-[#0b2340] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition-colors focus:border-[#0b2340] focus:ring-1 focus:ring-[#0b2340] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-400"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                Minimum 6 characters.
              </p>
            </div>

            {state?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex h-11 items-center justify-center rounded-md bg-[#0b2340] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2d52] disabled:opacity-50 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              {pending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-medium text-[#0b2340] hover:underline dark:text-teal-400"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Ripplr, Inc. Access restricted
            to authorized personnel.
          </p>
        </div>
      </div>
    </div>
  );
}

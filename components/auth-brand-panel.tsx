import Image from "next/image";

const features = [
  {
    title: "Centralized task tracking",
    description: "Plan, assign, and track work across every team from a single portal.",
  },
  {
    title: "Real-time collaboration",
    description: "Keep stakeholders aligned with live status updates and audit trails.",
  },
  {
    title: "Enterprise-grade security",
    description: "Access is authenticated and governed under Ripplr's security policy.",
  },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0b2340] px-16 py-14 text-white lg:flex lg:w-3/4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-teal-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/3 h-[32rem] w-[32rem] rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="relative z-10">
        <Image
          src="/logo.jpg"
          alt="Ripplr"
          width={800}
          height={200}
          priority
          className="h-10 w-auto rounded-sm"
        />
      </div>

      <div className="relative z-10 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
          Enterprise Workspace
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white">
          Ripplr Task Management Portal
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          The official platform for planning, assigning, and delivering work
          across Ripplr. Sign in with your company credentials to continue.
        </p>

        <dl className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <dt className="text-sm font-semibold text-white">
                {feature.title}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative z-10 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Ripplr. All rights reserved. ·
        Authorized personnel only.
      </div>
    </div>
  );
}

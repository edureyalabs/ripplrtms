import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const fieldClasses =
  "rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition-colors focus:border-brand-900 focus:ring-1 focus:ring-brand-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-400";

export function FormField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-400 dark:text-zinc-600">{hint}</p>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

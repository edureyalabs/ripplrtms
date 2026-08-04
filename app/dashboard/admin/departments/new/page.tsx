import { DepartmentForm } from "@/components/departments/department-form";

export default function NewDepartmentPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Department
      </h1>

      <DepartmentForm />
    </div>
  );
}

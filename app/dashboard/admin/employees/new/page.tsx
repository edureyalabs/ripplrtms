import { CreateEmployeeForm } from "@/components/employees/create-employee-form";

export default function NewEmployeePage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Employee
      </h1>

      <CreateEmployeeForm />
    </div>
  );
}

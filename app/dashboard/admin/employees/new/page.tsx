import { createClient } from "@/lib/supabase/server";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New Employee
      </h1>

      <EmployeeForm departments={departments ?? []} />
    </div>
  );
}

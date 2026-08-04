import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: departments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, department_id, is_active")
      .eq("id", employeeId)
      .single(),
    supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!employee || (employee.role !== "dept_head" && employee.role !== "team_member")) {
    notFound();
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Edit Employee
      </h1>

      <EmployeeForm
        employee={{ ...employee, role: employee.role }}
        departments={departments ?? []}
      />
    </div>
  );
}

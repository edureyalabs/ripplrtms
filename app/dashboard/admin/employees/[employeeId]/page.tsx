import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignRoleForm } from "@/components/employees/assign-role-form";
import { SetCeoButton } from "@/components/employees/set-ceo-button";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/roles";

export default async function EmployeeDetailPage({
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

  if (!employee) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {employee.full_name || employee.email}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{employee.email}</p>
        </div>
        <Badge tone={employee.role === "ceo" ? "brand" : employee.role ? "neutral" : "warning"}>
          {roleLabel(employee.role)}
        </Badge>
      </div>

      <AssignRoleForm employee={employee} departments={departments ?? []} />

      {employee.role !== "ceo" && (
        <div className="mt-8 max-w-lg border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CEO</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            There is only ever one CEO. Setting a new one automatically moves the current CEO to
            Admin.
          </p>
          <div className="mt-3">
            <SetCeoButton userId={employee.id} />
          </div>
        </div>
      )}
    </div>
  );
}

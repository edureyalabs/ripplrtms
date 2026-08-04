import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/roles";
import { Card } from "@/components/ui/card";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_path, is_active, departments(name)")
    .order("full_name");

  const ceo = employees?.find((emp) => emp.role === "ceo");
  const rest = employees?.filter((emp) => emp.role !== "ceo") ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Employees
          </h1>
        </div>
        <Link
          href="/dashboard/admin/employees/new"
          className="flex h-10 items-center justify-center rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:text-white dark:hover:bg-accent-600"
        >
          New Employee
        </Link>
      </div>

      <Card className="mt-8 overflow-hidden">
        {!employees || employees.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No employees yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {ceo && (
                <tr className="bg-accent-50 dark:bg-accent-500/10">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={ceo.full_name || ceo.email} avatarPath={ceo.avatar_path} size="sm" />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {ceo.full_name || "—"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{ceo.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone="brand">CEO</Badge>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {ceo.departments?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={ceo.is_active ? "success" : "neutral"}>
                      {ceo.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/employees/${ceo.id}`}
                      className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-500"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              )}
              {rest.map((emp) => (
                <tr key={emp.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-50-dark">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.full_name || emp.email} avatarPath={emp.avatar_path} size="sm" />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {emp.full_name || "—"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={emp.role ? "neutral" : "warning"}>{roleLabel(emp.role)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {emp.departments?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={emp.is_active ? "success" : "neutral"}>
                      {emp.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/employees/${emp.id}`}
                      className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-500"
                    >
                      {emp.role ? "Manage" : "Assign role"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

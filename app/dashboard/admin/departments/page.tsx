import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function DepartmentsPage() {
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, description, is_active")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Departments
          </h1>
        </div>
        <Link
          href="/dashboard/admin/departments/new"
          className="flex h-10 items-center justify-center rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-500 dark:bg-accent-500 dark:text-white dark:hover:bg-accent-600"
        >
          New Department
        </Link>
      </div>

      <Card className="mt-8 overflow-hidden">
        {!departments || departments.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No departments yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-surface-border-dark dark:bg-surface-50-dark dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {departments.map((dept) => (
                <tr key={dept.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-50-dark">
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {dept.name}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {dept.description || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={dept.is_active ? "success" : "neutral"}>
                      {dept.is_active ? "Active" : "Archived"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/departments/${dept.id}/edit`}
                      className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-500"
                    >
                      Edit
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

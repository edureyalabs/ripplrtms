import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Departments
          </h1>
        </div>
        <Link
          href="/dashboard/admin/departments/new"
          className="flex h-10 items-center justify-center rounded-md bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          New Department
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {!departments || departments.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No departments yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {departments.map((dept) => (
                <tr key={dept.id}>
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
                      className="text-sm font-medium text-brand-900 hover:underline dark:text-teal-400"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

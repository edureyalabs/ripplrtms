import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DepartmentForm } from "@/components/departments/department-form";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  const supabase = await createClient();
  const { data: department } = await supabase
    .from("departments")
    .select("id, name, description, is_active")
    .eq("id", departmentId)
    .single();

  if (!department) {
    notFound();
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Edit Department
      </h1>

      <DepartmentForm department={department} />
    </div>
  );
}

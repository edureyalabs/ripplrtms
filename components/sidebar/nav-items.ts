import type { Enums } from "@/lib/types/database";

export type NavItem = {
  label: string;
  href: string;
  roles: "all" | Enums<"user_role">[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "My Tasks", href: "/dashboard", roles: "all" },
  { label: "Projects", href: "/dashboard/projects", roles: "all" },
  { label: "Overview", href: "/dashboard/overview", roles: ["admin", "ceo", "dept_head"] },
  { label: "Departments", href: "/dashboard/admin/departments", roles: ["admin"] },
  { label: "Employees", href: "/dashboard/admin/employees", roles: ["admin"] },
];

export function navItemsForRole(role: Enums<"user_role">) {
  return NAV_ITEMS.filter((item) => item.roles === "all" || item.roles.includes(role));
}

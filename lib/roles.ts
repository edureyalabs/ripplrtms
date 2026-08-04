import type { Enums } from "@/lib/types/database";

export const ROLE_LABELS: Record<Enums<"user_role">, string> = {
  admin: "Admin",
  ceo: "CEO",
  dept_head: "Dept Head",
  team_member: "Team Member",
};

export function roleLabel(role: Enums<"user_role"> | null) {
  return role ? ROLE_LABELS[role] : "Pending Setup";
}

export type UserRole = "USER" | "MODERATOR" | "ADMIN" | "OWNER";

export function isStaffRole(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function hasRoleBadge(role?: string | null): role is Exclude<UserRole, "USER"> {
  return role === "OWNER" || role === "ADMIN" || role === "MODERATOR";
}

export const roleBadgeLabels: Record<Exclude<UserRole, "USER">, string> = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MODERATOR: "MOD",
};
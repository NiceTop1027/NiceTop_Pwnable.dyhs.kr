export type UserRole = "USER" | "MODERATOR" | "ADMIN" | "OWNER";

export function isStaffRole(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function hasRoleBadge(role?: string | null): role is Exclude<UserRole, "USER"> {
  return role === "OWNER" || role === "ADMIN" || role === "MODERATOR";
}

export const roleTitles: Record<Exclude<UserRole, "USER">, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MODERATOR: "모더레이터",
};
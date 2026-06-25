export function isStaffRole(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}
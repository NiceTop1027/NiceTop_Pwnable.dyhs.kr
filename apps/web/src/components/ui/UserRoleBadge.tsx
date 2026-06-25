import { hasRoleBadge, roleBadgeLabels, type UserRole } from "@/lib/roles";

type UserRoleBadgeProps = {
  role?: string | null;
  className?: string;
};

export function UserRoleBadge({ role, className = "" }: UserRoleBadgeProps) {
  if (!hasRoleBadge(role)) return null;

  const label = roleBadgeLabels[role as Exclude<UserRole, "USER">];
  const variant =
    role === "OWNER" ? "owner" : role === "ADMIN" ? "admin" : "moderator";

  return (
    <span
      className={`role-badge role-badge--${variant}${className ? ` ${className}` : ""}`}
      title={
        role === "OWNER"
          ? "소유자"
          : role === "ADMIN"
            ? "관리자"
            : "모더레이터"
      }
    >
      {label}
    </span>
  );
}
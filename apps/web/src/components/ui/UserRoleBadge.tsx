import { Crown, Gavel, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasRoleBadge, roleTitles, type UserRole } from "@/lib/roles";

type UserRoleBadgeProps = {
  role?: string | null;
  className?: string;
};

const roleIcons: Record<
  Exclude<UserRole, "USER">,
  { Icon: LucideIcon; variant: string; filled?: boolean }
> = {
  OWNER: { Icon: Crown, variant: "owner", filled: true },
  ADMIN: { Icon: Shield, variant: "admin" },
  MODERATOR: { Icon: Gavel, variant: "moderator" },
};

export function UserRoleBadge({ role, className = "" }: UserRoleBadgeProps) {
  if (!hasRoleBadge(role)) return null;

  const staffRole = role as Exclude<UserRole, "USER">;
  const { Icon, variant, filled } = roleIcons[staffRole];

  return (
    <span
      className={`role-mark role-mark--${variant}${className ? ` ${className}` : ""}`}
      title={roleTitles[staffRole]}
      aria-label={roleTitles[staffRole]}
    >
      <Icon
        className={`role-mark-icon${filled ? " role-mark-icon--filled" : ""}`}
        strokeWidth={1.75}
        aria-hidden
      />
    </span>
  );
}
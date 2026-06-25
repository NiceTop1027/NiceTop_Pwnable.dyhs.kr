import { UserRoleBadge } from "./UserRoleBadge";

type UserNameWithBadgeProps = {
  name: string;
  role?: string | null;
  className?: string;
  nameClassName?: string;
};

export function UserNameWithBadge({
  name,
  role,
  className = "",
  nameClassName = "",
}: UserNameWithBadgeProps) {
  return (
    <span className={`user-name-with-badge${className ? ` ${className}` : ""}`}>
      <span className={nameClassName || undefined}>{name}</span>
      <UserRoleBadge role={role} />
    </span>
  );
}
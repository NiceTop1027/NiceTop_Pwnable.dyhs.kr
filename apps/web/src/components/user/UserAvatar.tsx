import { resolveAvatarUrl } from "@/lib/avatar";
import { authorName } from "@/lib/community";

type UserAvatarProps = {
  user: {
    username: string;
    displayName: string | null;
    avatarUrl?: string | null;
  };
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizeClass = {
  xs: "user-avatar--xs",
  sm: "user-avatar--sm",
  md: "user-avatar--md",
} as const;

export function UserAvatar({
  user,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const name = authorName(user);
  const initial = name.charAt(0).toUpperCase();
  const src = resolveAvatarUrl(user.avatarUrl);

  return (
    <span
      className={`user-avatar ${sizeClass[size]}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="user-avatar-img" />
      ) : (
        <span className="user-avatar-initial">{initial}</span>
      )}
    </span>
  );
}
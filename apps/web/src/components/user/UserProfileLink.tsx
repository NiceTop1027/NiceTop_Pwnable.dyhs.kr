import Link from "next/link";
import type { BoardAuthor } from "@/lib/api";
import { authorName, userProfilePath } from "@/lib/community";
import { UserAvatar } from "./UserAvatar";

type UserProfileLinkProps = {
  user: Pick<BoardAuthor, "username" | "displayName" | "avatarUrl">;
  size?: "xs" | "sm" | "md";
  showUsername?: boolean;
  className?: string;
};

export function UserProfileLink({
  user,
  size = "sm",
  showUsername = false,
  className = "",
}: UserProfileLinkProps) {
  const name = authorName(user);

  return (
    <Link
      href={userProfilePath(user.username)}
      className={`user-profile-link${className ? ` ${className}` : ""}`}
    >
      <UserAvatar user={user} size={size} />
      <span className="user-profile-link-text">
        <span className="user-profile-link-name">{name}</span>
        {showUsername && (
          <span className="user-profile-link-username">@{user.username}</span>
        )}
      </span>
    </Link>
  );
}
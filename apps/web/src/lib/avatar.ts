import { isSafeMediaUrl } from "./safe-url";

export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || !isSafeMediaUrl(avatarUrl)) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  if (avatarUrl.startsWith("/api/uploads")) return avatarUrl;
  if (avatarUrl.startsWith("/uploads")) {
    return avatarUrl.replace(/^\/uploads/, "/api/uploads");
  }
  if (avatarUrl.startsWith("/")) return avatarUrl;
  return `/api/uploads/avatars/${avatarUrl}`;
}

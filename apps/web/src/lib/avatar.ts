import { buildApiUrl } from "./api";
import { isSafeMediaUrl } from "./safe-url";

const SERVER_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4001";

export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || !isSafeMediaUrl(avatarUrl)) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const path = avatarUrl.startsWith("/uploads")
    ? avatarUrl.replace(/^\/uploads/, "/api/uploads")
    : avatarUrl.startsWith("/")
      ? avatarUrl
      : `/api/uploads/${avatarUrl}`;
  if (typeof window !== "undefined") {
    return buildApiUrl(path.replace(/^\/api/, ""));
  }
  return `${SERVER_API_URL}${path}`;
}
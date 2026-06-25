const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const path = avatarUrl.startsWith("/uploads")
    ? avatarUrl.replace(/^\/uploads/, "/api/uploads")
    : avatarUrl.startsWith("/")
      ? avatarUrl
      : `/api/uploads/${avatarUrl}`;
  return `${API_URL}${path}`;
}
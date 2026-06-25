const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

/** 문서·에디터용 업로드 URL을 브라우저에서 불러올 수 있는 절대 경로로 변환 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  const path = url.startsWith("/api/uploads")
    ? url
    : url.startsWith("/uploads")
      ? url.replace(/^\/uploads/, "/api/uploads")
      : url.startsWith("/")
        ? url
        : `/api/uploads/${url}`;

  return `${API_URL}${path}`;
}
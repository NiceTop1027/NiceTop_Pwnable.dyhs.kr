import { buildApiUrl, resolveServerApiUrl } from "./api";
import { isSafeMediaUrl } from "./safe-url";

const SERVER_API_URL = resolveServerApiUrl();

/** 문서·에디터용 업로드 URL을 브라우저에서 불러올 수 있는 절대 경로로 변환 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url || !isSafeMediaUrl(url)) return null;
  if (url.startsWith("http")) return url;

  const path = url.startsWith("/api/uploads")
    ? url
    : url.startsWith("/uploads")
      ? url.replace(/^\/uploads/, "/api/uploads")
      : url.startsWith("/")
        ? url
        : `/api/uploads/${url}`;

  if (typeof window !== "undefined") {
    return buildApiUrl(path.replace(/^\/api/, ""));
  }
  return `${SERVER_API_URL}${path}`;
}

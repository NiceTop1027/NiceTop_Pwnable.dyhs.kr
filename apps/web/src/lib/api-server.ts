import { cookies } from "next/headers";
import { ApiError, apiFetch, buildApiUrl } from "./api";
import type { LectureDetail } from "./api";

function mergeCookieHeader(existing: string, fresh: string): string {
  const jar = new Map<string, string>();

  for (const chunk of [existing, fresh]) {
    for (const part of chunk.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }

  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function readSetCookieHeader(response: Response): string {
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie
      .call(response.headers)
      .map((cookie) => cookie.split(";")[0]?.trim())
      .filter(Boolean)
      .join("; ");
  }

  const single = response.headers.get("set-cookie");
  if (!single) return "";
  return single
    .split(/,(?=[^;]+?=)/)
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function refreshServerSession(cookieHeader: string): Promise<string | null> {
  const response = await fetch(buildApiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const refreshedCookies = readSetCookieHeader(response);
  return refreshedCookies
    ? mergeCookieHeader(cookieHeader, refreshedCookies)
    : cookieHeader;
}

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit & { skipAuthRetry?: boolean } = {},
) {
  const cookieStore = await cookies();
  let serverCookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    return await apiFetch<T>(path, {
      ...options,
      serverCookieHeader: serverCookieHeader || undefined,
      skipAuthRetry: true,
    });
  } catch (error) {
    if (
      options.skipAuthRetry ||
      !(error instanceof ApiError) ||
      error.status !== 401 ||
      !serverCookieHeader
    ) {
      throw error;
    }

    const refreshed = await refreshServerSession(serverCookieHeader);
    if (!refreshed) throw error;

    serverCookieHeader = refreshed;
    return apiFetch<T>(path, {
      ...options,
      serverCookieHeader,
      skipAuthRetry: true,
    });
  }
}

export async function serverLecture(slug: string, pageSlug?: string) {
  const path = pageSlug ? `/lectures/${slug}/${pageSlug}` : `/lectures/${slug}`;
  return serverApiFetch<LectureDetail>(path);
}
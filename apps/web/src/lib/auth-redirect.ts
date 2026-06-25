export function getSafeRedirectPath(next: string | null | undefined, fallback = "/profile") {
  if (!next) return fallback;

  try {
    const url = new URL(next, "http://local");
    if (url.origin !== "http://local") return fallback;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return fallback;
    }
    if (url.pathname.startsWith("/auth")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function appendNextToAuthPath(
  base: "/auth" | "/auth/login" | "/auth?tab=register",
  next: string | null | undefined,
) {
  const safe = getSafeRedirectPath(next, "");
  if (!safe) return base;
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}next=${encodeURIComponent(safe)}`;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

function trustedHosts(): Set<string> {
  const hosts = new Set<string>();
  try {
    hosts.add(new URL(API_URL).host);
  } catch {
    // ignore invalid API_URL
  }
  if (typeof window !== "undefined") {
    hosts.add(window.location.host);
  }
  return hosts;
}

/** Markdown links: allow same-origin paths and http(s) to trusted hosts only. */
export function isSafeHref(href: string | null | undefined): boolean {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (href.startsWith("#")) return true;

  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return trustedHosts().has(url.host);
  } catch {
    return false;
  }
}

/** Media/avatar URLs: reject javascript/data/blob; allow trusted http(s) or API-relative paths. */
export function isSafeMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:")
  ) {
    return false;
  }

  if (url.startsWith("/") && !url.startsWith("//")) return true;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return trustedHosts().has(parsed.host);
  } catch {
    return false;
  }
}
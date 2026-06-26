import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appendNextToAuthPath } from "@/lib/auth-redirect";

const ACCESS_COOKIE = "pwnable_access_token";
const REFRESH_COOKIE = "pwnable_refresh_token";
const STAFF_ROLES = new Set(["OWNER", "ADMIN"]);

function hasSession(request: NextRequest) {
  return (
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE)
  );
}

function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as { role?: string; exp?: number };
    if (json.exp && json.exp * 1000 < Date.now()) return null;
    return json.role ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!hasSession(request)) {
      const login = appendNextToAuthPath(
        "/auth/login",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(new URL(login, request.url));
    }

    const access = request.cookies.get(ACCESS_COOKIE)?.value;
    if (access) {
      const role = decodeJwtRole(access);
      if (role && !STAFF_ROLES.has(role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    if (!hasSession(request)) {
      const login = appendNextToAuthPath(
        "/auth/login",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(new URL(login, request.url));
    }
  }

  if (pathname.startsWith("/curriculum/") && pathname !== "/curriculum") {
    if (!hasSession(request)) {
      const login = appendNextToAuthPath(
        "/auth/login",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(new URL(login, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/profile/:path*",
    "/curriculum/:path*",
  ],
};

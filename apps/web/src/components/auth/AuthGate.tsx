"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";

function buildAuthRedirect(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  const next = query ? `${pathname}?${query}` : pathname;
  return `/auth?next=${encodeURIComponent(next)}`;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(buildAuthRedirect(pathname, searchParams));
    }
  }, [user, isLoading, router, pathname, searchParams]);

  if (isLoading || !user) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-loading">
          <span className="auth-spinner" />
          로그인 확인 중
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
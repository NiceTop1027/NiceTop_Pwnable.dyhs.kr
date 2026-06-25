"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

export function HeaderAuth({ mobile = false }: { mobile?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    const name = user.displayName ?? user.username;
    const staff = user.role === "OWNER" || user.role === "ADMIN";

    if (mobile) {
      return (
        <div className="mt-8 flex flex-col gap-4">
          {staff && (
            <Link href="/admin" className="text-center text-[1.0625rem] text-[var(--text-secondary)]">
              관리자
            </Link>
          )}
          <Link
            href="/profile"
            className="text-center text-[1.0625rem] text-[var(--text)]"
          >
            {name}
          </Link>
        </div>
      );
    }

    return (
      <>
        {staff && (
          <Link
            href="/admin"
            className="text-xs text-[var(--text-secondary)] transition-opacity hover:opacity-60"
          >
            관리자
          </Link>
        )}
        <Link
          href="/profile"
          className="text-xs text-[var(--text-secondary)] transition-opacity hover:opacity-60"
        >
          {name}
        </Link>
      </>
    );
  }

  if (mobile) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        <Button href="/auth" variant="outline" className="justify-center">
          로그인
        </Button>
        <Button href="/auth?tab=register" variant="fill" className="justify-center">
          시작하기
        </Button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/auth"
        className="text-xs text-[var(--text-secondary)] transition-opacity hover:opacity-60"
      >
        로그인
      </Link>
      <Button href="/auth?tab=register" variant="fill" className="!px-4 !py-1.5 !text-xs">
        시작하기
      </Button>
    </>
  );
}
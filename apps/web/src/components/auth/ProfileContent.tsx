"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/pages/FadeIn";
import { useAuth, getAccessToken } from "@/providers/AuthProvider";
import { api, type AuthUser } from "@/lib/api";

type MeUser = AuthUser & {
  _count: { solves: number; achievements: number; lectureProgress: number };
};

export function ProfileContent() {
  const { user, level, isLoading, logout } = useAuth();
  const [stats, setStats] = useState<MeUser["_count"] | null>(null);

  useEffect(() => {
    if (!user) {
      setStats(null);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    api.me(token).then((me) => setStats(me._count)).catch(() => setStats(null));
  }, [user]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[var(--text-secondary)]">
        불러오는 중…
      </div>
    );
  }

  if (!user) {
    return (
      <FadeIn delay={0.1}>
        <div className="border-t border-[var(--divider)] py-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-muted)] text-2xl font-semibold text-[var(--text-secondary)]">
            ?
          </div>
          <p className="mt-6 text-[1.0625rem] text-[var(--text)]">
            로그인이 필요합니다
          </p>
          <p className="text-body mt-2">
            회원가입 후 프로필과 학습 기록을 확인할 수 있습니다
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button href="/auth/login" variant="outline">
              로그인
            </Button>
            <Button href="/auth/register" variant="fill">
              회원가입
            </Button>
          </div>
        </div>
      </FadeIn>
    );
  }

  const displayName = user.displayName ?? user.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <FadeIn delay={0.1}>
        <div className="border-t border-[var(--divider)] py-12">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-2xl font-semibold text-[var(--text)]">
              {initial}
            </div>
            <div className="mt-6 sm:mt-0">
              <h2 className="text-[1.75rem] font-semibold tracking-tight text-[var(--text)]">
                {displayName}
              </h2>
              <p className="text-body mt-1">@{user.username}</p>
              <p className="text-caption mt-2">{user.role}</p>
              <button
                type="button"
                onClick={() => logout()}
                className="text-caption mt-6 text-[var(--text-secondary)] transition-opacity hover:opacity-70"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <p className="text-eyebrow mb-6">학습 현황</p>
        <div className="grid gap-px border border-[var(--divider)] bg-[var(--divider)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "레벨", value: `Lv.${level}` },
            { label: "경험치", value: user.score.toLocaleString() },
            { label: "완료 강의", value: stats ? String(stats.lectureProgress) : "—" },
            { label: "해결 문제", value: stats ? String(stats.solves) : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-black p-6 text-center">
              <p className="text-caption">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{s.value}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </>
  );
}
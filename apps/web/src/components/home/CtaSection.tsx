"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/lib/use-hydrated";
import { useAuth } from "@/providers/AuthProvider";

export function CtaSection() {
  const { user, isLoading } = useAuth();
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <section ref={ref} className="home-section home-section--cta">
      <motion.div
        style={hydrated ? { opacity, y } : undefined}
        className="home-section-inner home-cta-copy"
      >
        {!isLoading && user ? (
          <>
            <h2 className="text-headline-sm">계속해서 성장하세요</h2>
            <p className="text-body-lg home-scroll-copy mx-auto mt-6 max-w-2xl">
              {user.displayName ?? user.username}님, 오늘도 한 걸음 더 나아가 보세요
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Button href="/curriculum" variant="fill">
                학습 이어하기
              </Button>
              <Button href="/wargame" variant="outline">
                워게임 도전
              </Button>
            </div>
          </>
        ) : !isLoading ? (
          <>
            <h2 className="text-headline-sm">지금 시작하세요</h2>
            <p className="text-body-lg home-scroll-copy mx-auto mt-6 max-w-2xl">
              무료 회원가입 후 강의, 워게임, CTF에 바로 참여할 수 있습니다
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Button href="/auth?tab=register" variant="fill">
                회원가입
              </Button>
              <Button href="/wargame" variant="outline">
                워게임 도전
              </Button>
            </div>
          </>
        ) : null}
      </motion.div>
    </section>
  );
}
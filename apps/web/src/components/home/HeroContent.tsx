"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/lib/use-hydrated";
import {
  SITE_HERO_SUBLINE,
  SITE_HERO_TITLE,
  SITE_NAME,
} from "@/lib/site";
import { useAuth } from "@/providers/AuthProvider";

const ENTRANCE = {
  eyebrow: { duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const },
  title: { duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  subline: { duration: 0.9, delay: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  actions: { duration: 0.9, delay: 0.52, ease: [0.22, 1, 0.36, 1] as const },
};

export function HeroContent() {
  const { user, isLoading } = useAuth();
  const hydrated = useHydrated();

  return (
    <div className="cinematic-hero mx-auto max-w-5xl px-6 text-center">
      <motion.p
        initial={hydrated ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={ENTRANCE.eyebrow}
        className="cinematic-eyebrow mb-8"
      >
        {SITE_NAME}
      </motion.p>

      <motion.h1
        initial={hydrated ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={ENTRANCE.title}
        className="text-display"
      >
        {SITE_HERO_TITLE[0]}
        <br />
        {SITE_HERO_TITLE[1]}
      </motion.h1>

      <motion.p
        initial={hydrated ? { opacity: 0, y: 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={ENTRANCE.subline}
        className="text-subhead cinematic-subline mx-auto mt-8 max-w-2xl"
      >
        {SITE_HERO_SUBLINE[0]}
        <br />
        {SITE_HERO_SUBLINE[1]}
      </motion.p>

      {!isLoading && (
        <motion.div
          initial={hydrated ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={ENTRANCE.actions}
          className="mt-14 flex flex-wrap items-center justify-center gap-5"
        >
          {user ? (
            <>
              <Button href="/curriculum" variant="fill">
                학습 시작
              </Button>
              <Button href="/profile" variant="text">
                내 프로필
              </Button>
            </>
          ) : (
            <>
              <Button href="/auth?tab=register" variant="fill">
                시작하기
              </Button>
              <Button href="/curriculum" variant="text">
                커리큘럼 보기
              </Button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
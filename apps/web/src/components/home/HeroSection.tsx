"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useHomeStoryTrack } from "@/components/home/HomeStoryTrack";
import {
  SITE_HERO_SUBLINE,
  SITE_HERO_TITLE,
  SITE_NAME,
} from "@/lib/site";
import { useAuth } from "@/providers/AuthProvider";

export function HeroSection() {
  const { user, isLoading } = useAuth();
  const trackRef = useHomeStoryTrack();
  const { scrollYProgress } = useScroll({
    target: trackRef ?? undefined,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.11], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05, 0.11], [1, 1, 0.94]);
  const blur = useTransform(scrollYProgress, [0.04, 0.11], [0, 10]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.08, 0.12], [1, 0.7, 0]);

  return (
    <section className="home-hero relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <motion.div style={{ opacity: glowOpacity }} className="home-hero-glow" aria-hidden>
        <span className="home-hero-glow-core" />
        <span className="home-hero-glow-ring" />
      </motion.div>
      <motion.div
        style={{ opacity, scale, filter }}
        className="mx-auto max-w-4xl text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-eyebrow mb-8"
        >
          {SITE_NAME}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-hero"
        >
          {SITE_HERO_TITLE[0]}
          <br />
          {SITE_HERO_TITLE[1]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-subhead home-scroll-copy mx-auto mt-6 max-w-2xl"
        >
          {SITE_HERO_SUBLINE[0]}
          <br />
          {SITE_HERO_SUBLINE[1]}
        </motion.p>

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-12 flex flex-wrap items-center justify-center gap-5"
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
      </motion.div>
    </section>
  );
}
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center bg-black px-6 pt-16">
      <motion.div
        style={{ opacity, y }}
        className="mx-auto max-w-4xl text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-eyebrow mb-8"
        >
          pwnable.dyhs.kr
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-hero"
        >
          포너블을 배우는
          <br />
          가장 완벽한 방법
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-subhead mx-auto mt-6 max-w-xl"
        >
          강의 · 워게임 · CTF · 커뮤니티
          <br />
          한국 학생을 위해 만들었습니다
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          <Button href="/auth/register" variant="fill">
            시작하기
          </Button>
          <Button href="/curriculum" variant="text">
            커리큘럼 보기
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
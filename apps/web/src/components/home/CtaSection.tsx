"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  return (
    <section ref={ref} className="bg-black px-6 py-40">
      <motion.div
        style={{ opacity, y, scale }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-headline-sm">
          지금 시작하세요
        </h2>
        <p className="text-body-lg mx-auto mt-6 max-w-lg">
          무료 회원가입 후 강의, 워게임, CTF에 바로 참여할 수 있습니다
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
          <Button href="/auth/register" variant="fill">
            회원가입
          </Button>
          <Button href="/wargame" variant="outline">
            워게임 도전
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
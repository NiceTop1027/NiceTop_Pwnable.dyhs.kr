"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  { title: "커리큘럼", desc: "Markdown 강의 · 3-Track · Beginner → Advanced", href: "/curriculum" },
  { title: "워게임", desc: "Docker 실습 · FLAG 제출 · First Blood", href: "/wargame" },
  { title: "CTF", desc: "개인전/팀전 · 실시간 스코어보드", href: "/ctf" },
  { title: "랭킹", desc: "경험치 · 시즌 · Lv.50 Legendary Hacker", href: "/ranking" },
  { title: "커뮤니티", desc: "질문 · 공략 · 자유게시판", href: "/community" },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.3], [40, 0]);

  return (
    <section ref={ref} className="bg-black px-6 py-32">
      <div className="mx-auto max-w-[680px]">
        <motion.div style={{ opacity, y }} className="mb-16 text-center">
          <p className="text-eyebrow mb-4">기능</p>
          <h2 className="text-headline-sm">필요한 모든 것</h2>
        </motion.div>

        <div>
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="feature-row group block">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[1.75rem] font-semibold tracking-tight text-[var(--text)] transition-opacity group-hover:opacity-70">
                  {f.title}
                </h3>
                <span className="text-body shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                  더 알아보기 ›
                </span>
              </div>
              <p className="text-body">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
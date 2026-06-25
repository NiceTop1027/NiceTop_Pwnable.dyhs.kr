"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";

const features = [
  { title: "커리큘럼", desc: "입문 · 중급 · 고급 단계별 학습 로드맵", href: "/curriculum" },
  { title: "워게임", desc: "Docker 실습 · FLAG 제출 · First Blood", href: "/wargame" },
  { title: "CTF", desc: "개인전/팀전 · 실시간 스코어보드", href: "/ctf" },
  { title: "랭킹", desc: "경험치 · 시즌 · Lv.50 Legendary Hacker", href: "/ranking" },
  { title: "커뮤니티", desc: "질문 · 공략 · 자유게시판", href: "/community" },
];

export function FeaturesSection() {
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.4"],
  });
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 1], [24, 0]);

  return (
    <section ref={ref} className="home-section">
      <div className="home-section-inner">
        <motion.div
          style={hydrated ? { opacity: headerOpacity, y: headerY } : undefined}
          className="home-section-header"
        >
          <p className="text-eyebrow mb-4">기능</p>
          <h2 className="text-headline-sm">필요한 모든 것</h2>
        </motion.div>

        <div className="feature-list">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="feature-row group">
              <div className="feature-row-main">
                <h3 className="feature-row-title">{feature.title}</h3>
                <p className="feature-row-desc">{feature.desc}</p>
              </div>
              <span className="feature-row-action">더 알아보기</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
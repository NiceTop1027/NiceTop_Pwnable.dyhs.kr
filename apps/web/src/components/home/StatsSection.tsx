"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CountUp } from "@/components/animations/CountUp";

const stats = [
  { value: 14, suffix: "+", label: "강의 카테고리", sub: "기초 → 고급" },
  { value: 100, suffix: "+", label: "워게임 문제", sub: "실전 exploit" },
  { value: 1000, suffix: "+", label: "학습자", sub: "전국 학생" },
  { value: 50, suffix: "", label: "최고 레벨", sub: "Legendary Hacker" },
];

export function StatsSection() {
  return (
    <section className="relative border-y border-white/5 bg-slate-950/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <p className="section-label text-center">Platform Metrics</p>
          <h2 className="mt-4 text-center text-3xl font-bold text-white sm:text-4xl">
            숫자로 보는 성장
          </h2>
        </ScrollReveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1} className="bg-slate-950 p-8 sm:p-10">
              <p className="font-mono text-4xl font-bold text-cyan-400 sm:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-base font-semibold text-white">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.sub}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
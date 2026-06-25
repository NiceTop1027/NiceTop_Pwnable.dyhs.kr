"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChapterAside } from "@/components/home/ChapterAside";
import { ChapterGrandeur } from "@/components/home/ChapterGrandeur";
import { HeroContent } from "@/components/home/HeroContent";
import { useHomeStoryScroll } from "@/components/home/HomeStoryTrack";
import {
  getActBlur,
  getActHeadlineGlow,
  getActOpacity,
  getActScale,
  getActTranslateY,
  getCinematicTotalVh,
  type ChapterMood,
} from "@/lib/cinematic-scroll";
import { useHydrated } from "@/lib/use-hydrated";

type Chapter = {
  eyebrow: string;
  headline: string;
  subline: string;
  mood: ChapterMood;
  aside?:
    | {
        variant: "syllabus";
        items: { index: string; title: string; status?: "done" | "active" | "next" }[];
      }
    | {
        variant: "terminal";
        lines: { kind: "prompt" | "out" | "ok" | "dim"; text: string }[];
      }
    | {
        variant: "scoreboard";
        rows: { rank: string; name: string; score: string; highlight?: boolean }[];
      }
    | {
        variant: "threads";
        items: { kind: "q" | "a" | "dot"; text: string }[];
      };
};

const CHAPTERS: Chapter[] = [
  {
    eyebrow: "커리큘럼",
    headline: "강의",
    subline: "Linux부터 Kernel Pwn까지, 체계적인 커리큘럼으로 기초를 다집니다",
    mood: "lecture",
    aside: {
      variant: "syllabus",
      items: [
        { index: "01", title: "Linux & Shell", status: "done" },
        { index: "02", title: "x86 · Memory Layout", status: "active" },
        { index: "03", title: "Stack · Format String", status: "next" },
        { index: "04", title: "ROP · Kernel Pwn", status: "next" },
      ],
    },
  },
  {
    eyebrow: "실습",
    headline: "워게임",
    subline: "Docker 실습 환경에서 직접 exploit을 작성하고 FLAG를 제출하세요",
    mood: "wargame",
    aside: {
      variant: "terminal",
      lines: [
        { kind: "prompt", text: "$ docker run -it --rm pwnable/wargame" },
        { kind: "out", text: "challenge@dyhs:~$ ./checksec vuln" },
        { kind: "dim", text: "  Stack: no canary · NX enabled" },
        { kind: "prompt", text: "$ python3 solve.py remote" },
        { kind: "ok", text: "[+] shell · flag submitted" },
      ],
    },
  },
  {
    eyebrow: "대회",
    headline: "CTF",
    subline: "개인전, 팀전, 실시간 스코어보드로 전국 학생과 겨루세요",
    mood: "ctf",
    aside: {
      variant: "scoreboard",
      rows: [
        { rank: "1", name: "dyhs_pwn", score: "4,200", highlight: true },
        { rank: "2", name: "kernel_kids", score: "3,850" },
        { rank: "3", name: "shellmates", score: "3,120" },
        { rank: "4", name: "ropstars", score: "2,940" },
      ],
    },
  },
  {
    eyebrow: "함께",
    headline: "커뮤니티",
    subline: "질문하고, 공유하고, 함께 성장하는 보안 학습 커뮤니티",
    mood: "community",
    aside: {
      variant: "threads",
      items: [
        { kind: "q", text: "ret2libc gadget 못 찾겠어요" },
        { kind: "a", text: "ROPgadget로 one_gadget 확인해보세요" },
        { kind: "dot", text: "시즌 2 CTF 후기 · 24개 댓글" },
        { kind: "dot", text: "Heap Overflow 풀이 공유" },
      ],
    },
  },
];

const TOTAL_ACTS = 1 + CHAPTERS.length + 1;

function CinematicAct({
  actIndex,
  scrollYProgress,
  children,
  className = "",
}: {
  actIndex: number;
  scrollYProgress: MotionValue<number>;
  children: ReactNode;
  className?: string;
}) {
  const opacity = useTransform(scrollYProgress, (value) => getActOpacity(value, actIndex));
  const scale = useTransform(scrollYProgress, (value) => getActScale(value, actIndex));
  const y = useTransform(scrollYProgress, (value) => getActTranslateY(value, actIndex));
  const blur = useTransform(scrollYProgress, (value) => getActBlur(value, actIndex));
  const filter = useTransform(blur, (value) => `blur(${value}px)`);
  const pointerEvents = useTransform(opacity, (value) => (value > 0.05 ? "auto" : "none"));

  return (
    <motion.div
      style={{ opacity, scale, y, filter, pointerEvents }}
      className={`cinematic-act ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ChapterSlide({
  chapter,
  actIndex,
  scrollYProgress,
}: {
  chapter: Chapter;
  actIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  const glow = useTransform(scrollYProgress, (value) => getActHeadlineGlow(value, actIndex));
  const glowShadow = useTransform(glow, (value) => {
    const colors: Record<ChapterMood, string> = {
      lecture: "120,165,255",
      wargame: "70,220,150",
      ctf: "255,130,90",
      community: "190,150,255",
    };
    const rgb = colors[chapter.mood];
    return `0 0 ${28 + value * 56}px rgba(${rgb},${0.08 + value * 0.22})`;
  });
  const accentWidth = useTransform(glow, (value) => `${8 + value * 28}rem`);

  return (
    <div className="cinematic-chapter mx-auto max-w-5xl px-6">
      <ChapterGrandeur mood={chapter.mood} actIndex={actIndex} scrollYProgress={scrollYProgress} />

      <div className="cinematic-copy text-center">
        <p className="cinematic-eyebrow mb-6">{chapter.eyebrow}</p>
        <div className="cinematic-headline-wrap">
          <motion.h2 style={{ textShadow: glowShadow }} className="text-display cinematic-headline cinematic-headline-shine">
            {chapter.headline}
          </motion.h2>
          <motion.span
            style={{ width: accentWidth, opacity: glow }}
            className={`cinematic-accent cinematic-accent--${chapter.mood}`}
            aria-hidden
          />
        </div>
        <p className="text-subhead cinematic-subline mx-auto mt-8 max-w-3xl">{chapter.subline}</p>
      </div>

      {chapter.aside ? (
        <ChapterAside actIndex={actIndex} scrollYProgress={scrollYProgress} {...chapter.aside} />
      ) : null}
    </div>
  );
}

function StatementSlide({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const glow = useTransform(scrollYProgress, (value) => getActHeadlineGlow(value, TOTAL_ACTS - 1));
  const brandGlow = useTransform(
    glow,
    (value) => `0 0 ${24 + value * 48}px rgba(255,255,255,${0.06 + value * 0.16})`,
  );

  return (
    <div className="cinematic-copy mx-auto max-w-5xl px-6 text-center">
      <p className="cinematic-eyebrow mb-6">올인원 플랫폼</p>
      <motion.h2
        style={{ textShadow: brandGlow }}
        className="text-headline-sm cinematic-headline cinematic-headline-shine home-scroll-brands"
      >
        <span>DreamHack</span>
        <span aria-hidden>·</span>
        <span>pwn.college</span>
        <span aria-hidden>·</span>
        <span>CTFd</span>
      </motion.h2>
      <span className="cinematic-accent cinematic-accent--statement" aria-hidden />
      <p className="text-body-lg cinematic-subline mx-auto mt-8 max-w-3xl">
        세 가지 플랫폼의 장점을 하나로 — 강의는 pwn.college처럼, 실습은 DreamHack처럼, 대회는
        CTFd처럼
      </p>
    </div>
  );
}

function CinematicProgress({
  scrollYProgress,
  totalActs,
  activeAct,
}: {
  scrollYProgress: MotionValue<number>;
  totalActs: number;
  activeAct: number;
}) {
  const hydrated = useHydrated();
  const fillWidth = useTransform(scrollYProgress, (value) => `${Math.min(100, Math.max(0, value * 100))}%`);

  return (
    <div className="scroll-progress-bar cinematic-progress-gauge" aria-label="스토리 진행" aria-live="polite">
      <span className="scroll-progress-count">{String(activeAct + 1).padStart(2, "0")}</span>
      <div className="scroll-progress-track" aria-hidden>
        <motion.span
          style={hydrated ? { width: fillWidth } : { width: "0%" }}
          className="scroll-progress-fill"
        />
      </div>
      <span className="scroll-progress-total">{String(totalActs).padStart(2, "0")}</span>
    </div>
  );
}

export function CinematicStory() {
  const scrollYProgress = useHomeStoryScroll();
  const [activeAct, setActiveAct] = useState(0);
  const totalVh = getCinematicTotalVh();

  useMotionValueEvent(scrollYProgress!, "change", (value) => {
    const next = Math.min(TOTAL_ACTS - 1, Math.max(0, Math.floor(value * TOTAL_ACTS)));
    setActiveAct(next);
  });

  useEffect(() => {
    if (!scrollYProgress) return;
    const value = scrollYProgress.get();
    setActiveAct(Math.min(TOTAL_ACTS - 1, Math.max(0, Math.floor(value * TOTAL_ACTS))));
  }, [scrollYProgress]);

  if (!scrollYProgress) return null;

  return (
    <div
      style={{ height: `${totalVh}vh` }}
      className="cinematic-story"
      data-active-act={activeAct}
    >
      <div className="cinematic-viewport">
        <div className="cinematic-stage">
          <CinematicAct actIndex={0} scrollYProgress={scrollYProgress}>
            <HeroContent />
          </CinematicAct>

          {CHAPTERS.map((chapter, index) => (
            <CinematicAct key={chapter.headline} actIndex={index + 1} scrollYProgress={scrollYProgress}>
              <ChapterSlide
                chapter={chapter}
                actIndex={index + 1}
                scrollYProgress={scrollYProgress}
              />
            </CinematicAct>
          ))}

          <CinematicAct actIndex={TOTAL_ACTS - 1} scrollYProgress={scrollYProgress}>
            <StatementSlide scrollYProgress={scrollYProgress} />
          </CinematicAct>
        </div>

        <CinematicProgress
          scrollYProgress={scrollYProgress}
          totalActs={TOTAL_ACTS}
          activeAct={activeAct}
        />
      </div>
    </div>
  );
}
"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { getChapterGrandeur, type ChapterMood } from "@/lib/cinematic-scroll";
import { useHydrated } from "@/lib/use-hydrated";

const MOOD_GHOST: Record<ChapterMood, string> = {
  lecture: "SYSTEMATIC",
  wargame: "PRACTICE",
  ctf: "COMPETE",
  community: "TOGETHER",
};

/** SSR·클라이언트 부동소수점 차이 방지 — 좌표 문자열 고정 */
const CTF_RADIAL_LINES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  return {
    x2: (100 + Math.cos(angle) * 78).toFixed(1),
    y2: (100 + Math.sin(angle) * 78).toFixed(1),
    major: i % 4 === 0,
  };
});

function MoodSigil({ mood }: { mood: ChapterMood }) {
  switch (mood) {
    case "lecture":
      return (
        <svg className="chapter-sigil chapter-sigil--lecture" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
          <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="32" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
          <path d="M100 28 L100 48 M100 152 L100 172 M28 100 L48 100 M152 100 L172 100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case "wargame":
      return (
        <svg className="chapter-sigil chapter-sigil--wargame" viewBox="0 0 200 200" aria-hidden>
          <rect x="44" y="52" width="112" height="96" rx="4" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
          <line x1="44" y1="72" x2="156" y2="72" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <circle cx="56" cy="62" r="3" fill="currentColor" opacity="0.35" />
          <circle cx="68" cy="62" r="3" fill="currentColor" opacity="0.25" />
          <circle cx="80" cy="62" r="3" fill="currentColor" opacity="0.2" />
          <rect x="58" y="108" width="10" height="18" fill="currentColor" opacity="0.5" className="chapter-sigil-cursor" />
        </svg>
      );
    case "ctf":
      return (
        <svg className="chapter-sigil chapter-sigil--ctf" viewBox="0 0 200 200" aria-hidden>
          {CTF_RADIAL_LINES.map((line, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={line.x2}
              y2={line.y2}
              stroke="currentColor"
              strokeWidth={line.major ? 0.75 : 0.35}
              opacity={line.major ? 0.45 : 0.18}
            />
          ))}
          <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.55" />
        </svg>
      );
    case "community":
      return (
        <svg className="chapter-sigil chapter-sigil--community" viewBox="0 0 200 200" aria-hidden>
          <line x1="100" y1="60" x2="60" y2="120" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1="100" y1="60" x2="140" y2="120" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1="60" y1="120" x2="140" y2="120" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1="100" y1="60" x2="100" y2="140" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <circle cx="100" cy="60" r="6" fill="currentColor" opacity="0.5" />
          <circle cx="60" cy="120" r="5" fill="currentColor" opacity="0.4" />
          <circle cx="140" cy="120" r="5" fill="currentColor" opacity="0.4" />
          <circle cx="100" cy="140" r="4" fill="currentColor" opacity="0.35" />
        </svg>
      );
    default:
      return null;
  }
}

function MoodDecor({ mood }: { mood: ChapterMood }) {
  switch (mood) {
    case "lecture":
      return (
        <div className="chapter-decor chapter-decor--lecture" aria-hidden>
          <span className="chapter-decor-line chapter-decor-line--a" />
          <span className="chapter-decor-line chapter-decor-line--b" />
          <div className="chapter-decor-grid" />
        </div>
      );
    case "wargame":
      return (
        <div className="chapter-decor chapter-decor--wargame" aria-hidden>
          <span className="chapter-decor-bracket chapter-decor-bracket--tl" />
          <span className="chapter-decor-bracket chapter-decor-bracket--br" />
          <div className="chapter-decor-scanline" />
        </div>
      );
    case "ctf":
      return (
        <div className="chapter-decor chapter-decor--ctf" aria-hidden>
          <span className="chapter-decor-beam chapter-decor-beam--l" />
          <span className="chapter-decor-beam chapter-decor-beam--r" />
          <span className="chapter-decor-podium" />
        </div>
      );
    case "community":
      return (
        <div className="chapter-decor chapter-decor--community" aria-hidden>
          <span className="chapter-decor-node chapter-decor-node--a" />
          <span className="chapter-decor-node chapter-decor-node--b" />
          <span className="chapter-decor-node chapter-decor-node--c" />
        </div>
      );
    default:
      return null;
  }
}

export function ChapterGrandeur({
  mood,
  actIndex,
  scrollYProgress,
}: {
  mood: ChapterMood;
  actIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).opacity);
  const scale = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).scale);
  const decorOpacity = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).decor);
  const beamOpacity = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).beam);
  const moodGlow = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).glow);
  const ringRotate = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).ringRotate);
  const ringRotateOuter = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).ringRotateOuter);
  const corePulse = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).corePulse);
  const ghostOpacity = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).decor * 0.55);
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <motion.div style={{ opacity }} className="chapter-grandeur" aria-hidden>
      <motion.div
        style={{ opacity: moodGlow, scale }}
        className={`chapter-grandeur-mood chapter-grandeur-mood--${mood}`}
      />

      <motion.div style={{ opacity: ghostOpacity }} className="chapter-ghost-mark-wrap">
        <span className={`chapter-ghost-mark chapter-ghost-mark--${mood}`}>{MOOD_GHOST[mood]}</span>
      </motion.div>

      <motion.div
        style={{ opacity: decorOpacity, rotate: ringRotateOuter, x: "-50%", y: "-50%" }}
        className="chapter-orbit chapter-orbit--outer"
      />
      <motion.div
        style={{ opacity: decorOpacity, rotate: ringRotate, x: "-50%", y: "-50%" }}
        className="chapter-orbit chapter-orbit--mid"
      />
      <motion.div
        style={{ opacity: decorOpacity, scale: corePulse, x: "-50%", y: "-50%" }}
        className={`chapter-orbit chapter-orbit--core chapter-orbit--${mood}`}
      >
        <MoodSigil mood={mood} />
      </motion.div>

      <motion.div style={{ opacity: decorOpacity }}>
        <MoodDecor mood={mood} />
      </motion.div>

      <motion.span style={{ opacity: corePulse, scale: corePulse }} className={`chapter-lens-core chapter-lens-core--${mood}`} />

      <motion.div style={{ opacity: beamOpacity }} className={`chapter-grandeur-beams chapter-grandeur-beams--${mood}`}>
        <span />
        <span />
        <span />
      </motion.div>
    </motion.div>
  );
}
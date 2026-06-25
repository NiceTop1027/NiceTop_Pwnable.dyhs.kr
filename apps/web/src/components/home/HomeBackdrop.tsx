"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useHomeStoryScroll } from "@/components/home/HomeStoryTrack";
import {
  getChapterGrandeur,
  getGrandeurIntensity,
  getMoodSceneStrength,
  getStoryAtmosphere,
  type ChapterMood,
} from "@/lib/cinematic-scroll";

const MOODS = ["intro", "lecture", "wargame", "ctf", "community", "statement"] as const;

const CHAPTER_LAYERS: { actIndex: number; mood: ChapterMood }[] = [
  { actIndex: 1, mood: "lecture" },
  { actIndex: 2, mood: "wargame" },
  { actIndex: 3, mood: "ctf" },
  { actIndex: 4, mood: "community" },
];

function AmbientScene({
  actIndex,
  scrollYProgress,
  mood,
}: {
  actIndex: number;
  scrollYProgress: MotionValue<number>;
  mood: (typeof MOODS)[number];
}) {
  const opacity = useTransform(scrollYProgress, (value) =>
    getMoodSceneStrength(value, actIndex),
  );

  return (
    <motion.div
      style={{ opacity }}
      className={`home-ambient-scene home-ambient-scene--${mood}`}
      aria-hidden
    />
  );
}

function ChapterBackdropLayer({
  actIndex,
  mood,
  scrollYProgress,
}: {
  actIndex: number;
  mood: ChapterMood;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).opacity);
  const scale = useTransform(scrollYProgress, (value) => getChapterGrandeur(value, actIndex).scale);

  return (
    <motion.div style={{ opacity, scale }} className={`chapter-backdrop chapter-backdrop--${mood}`} aria-hidden>
      <div className={`chapter-backdrop-glow chapter-backdrop-glow--${mood}`} />
      <div className="chapter-backdrop-grid" />
    </motion.div>
  );
}

export function HomeBackdrop() {
  const scrollYProgress = useHomeStoryScroll();

  const backdropOpacity = useTransform(scrollYProgress!, (value) => {
    if (value >= 0.92) return Math.max(0, 1 - (value - 0.92) / 0.08);
    return 1;
  });

  const vignetteStrength = useTransform(scrollYProgress!, (value) => {
    const { vignetteOpen } = getStoryAtmosphere(value);
    return 0.92 - vignetteOpen;
  });

  const storyLight = useTransform(scrollYProgress!, (value) => getStoryAtmosphere(value).light);
  const storyRingOpacity = useTransform(scrollYProgress!, (value) => getStoryAtmosphere(value).ring);
  const storyRingScale = useTransform(scrollYProgress!, (value) => getStoryAtmosphere(value).ringScale);

  const ctfBeam = useTransform(scrollYProgress!, (value) => getChapterGrandeur(value, 3).beam);
  const horizonGlow = useTransform(scrollYProgress!, (value) => getGrandeurIntensity(value) * 0.28);

  if (!scrollYProgress) return null;

  return (
    <motion.div style={{ opacity: backdropOpacity }} className="home-backdrop" aria-hidden>
      <div className="home-backdrop-base" />

      <div className="home-ambient-stack">
        {MOODS.map((mood, index) => (
          <AmbientScene
            key={mood}
            actIndex={index}
            scrollYProgress={scrollYProgress}
            mood={mood}
          />
        ))}
      </div>

      {CHAPTER_LAYERS.map(({ actIndex, mood }) => (
        <ChapterBackdropLayer
          key={mood}
          actIndex={actIndex}
          mood={mood}
          scrollYProgress={scrollYProgress}
        />
      ))}

      <motion.div style={{ opacity: storyLight }} className="story-atmosphere-light" />
      <motion.div
        style={{ opacity: storyRingOpacity, scale: storyRingScale, x: "-50%", y: "-50%" }}
        className="story-atmosphere-ring"
      />
      <motion.div
        style={{ opacity: storyRingOpacity, scale: storyRingScale, x: "-50%", y: "-50%" }}
        className="story-atmosphere-ring story-atmosphere-ring--outer"
      />

      <motion.div style={{ opacity: ctfBeam }} className="story-arena-beams" aria-hidden>
        <span />
        <span />
        <span />
      </motion.div>

      <motion.div style={{ opacity: horizonGlow }} className="story-horizon-glow" aria-hidden />

      <motion.div style={{ opacity: vignetteStrength }} className="home-backdrop-vignette" />
    </motion.div>
  );
}
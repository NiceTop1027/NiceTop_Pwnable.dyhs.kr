"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface SequenceItem {
  headline: string;
  subline: string;
}

function ChapterBackdrop({
  index,
  scrollYProgress,
  total,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  total: number;
}) {
  const segment = 1 / total;
  const start = index * segment;
  const peak = start + segment * 0.35;
  const end = start + segment * 0.85;
  const fadeOut = Math.min(end + segment * 0.15, 1);

  const opacity = useTransform(
    scrollYProgress,
    [start, peak, end, fadeOut],
    [0, 1, 0.85, 0],
  );

  return (
    <motion.div style={{ opacity }} className="scroll-chapter-backdrop" aria-hidden>
      <span className="scroll-chapter-index">{String(index + 1).padStart(2, "0")}</span>
    </motion.div>
  );
}

function SequenceSlide({
  item,
  scrollYProgress,
  index,
  total,
}: {
  item: SequenceItem;
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const segment = 1 / total;
  const start = index * segment;
  const peak = start + segment * 0.35;
  const end = start + segment * 0.85;
  const fadeOut = Math.min(end + segment * 0.15, 1);
  const hold = start + segment * 0.55;

  const opacity = useTransform(
    scrollYProgress,
    [start, peak, end, fadeOut],
    [0, 1, 1, 0],
  );
  const y = useTransform(scrollYProgress, [start, peak, end], [60, 0, -30]);
  const scale = useTransform(scrollYProgress, [start, peak, end], [0.92, 1, 0.96]);
  const blur = useTransform(
    scrollYProgress,
    [start, peak, end, fadeOut],
    [10, 0, 0, 8],
  );
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const labelOpacity = useTransform(scrollYProgress, [start, peak, hold], [0, 1, 1]);
  const labelY = useTransform(scrollYProgress, [start, peak], [12, 0]);

  return (
    <>
      <ChapterBackdrop index={index} scrollYProgress={scrollYProgress} total={total} />
      <motion.div
        style={{ opacity, y, scale, filter }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.p style={{ opacity: labelOpacity, y: labelY }} className="scroll-section-label mb-5">
          Chapter {String(index + 1).padStart(2, "0")}
        </motion.p>
        <h2 className="text-headline">{item.headline}</h2>
        <p className="text-subhead mx-auto mt-6 max-w-xl">{item.subline}</p>
      </motion.div>
    </>
  );
}

function ScrollProgressBar({
  progress,
  active,
  total,
}: {
  progress: number;
  active: number;
  total: number;
}) {
  return (
    <div className="scroll-progress-bar" aria-label="챕터 진행">
      <span className="scroll-progress-count">{String(active + 1).padStart(2, "0")}</span>
      <div className="scroll-progress-track">
        <div
          className="scroll-progress-fill"
          style={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` }}
        />
      </div>
      <span className="scroll-progress-total">{String(total).padStart(2, "0")}</span>
    </div>
  );
}

export function ScrollPinSequence({ items, height = "400vh" }: { items: SequenceItem[]; height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
    setActive(Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length))));
  });

  useEffect(() => {
    const v = scrollYProgress.get();
    setProgress(v);
    setActive(Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length))));
  }, [scrollYProgress, items.length]);

  return (
    <div ref={ref} style={{ height }} className="relative">
      <div className="scroll-pin-viewport">
        <div className="scroll-pin-content">
          <div className="scroll-pin-slides">
            {items.map((item, i) => (
              <SequenceSlide
                key={item.headline}
                item={item}
                scrollYProgress={scrollYProgress}
                index={i}
                total={items.length}
              />
            ))}
          </div>
        </div>
        <ScrollProgressBar progress={progress} active={active} total={items.length} />
      </div>
    </div>
  );
}

export function ScrollPinStatement({
  eyebrow,
  headline,
  body,
  height = "250vh",
}: {
  eyebrow?: string;
  headline: string;
  body: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.15, 0.35, 0.65], [80, 0, -40]);
  const scale = useTransform(scrollYProgress, [0.15, 0.4], [0.9, 1]);

  return (
    <div ref={ref} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center">
        <motion.div
          style={{ opacity, y, scale }}
          className="mx-auto max-w-4xl px-6 text-center"
        >
          {eyebrow && <p className="text-eyebrow mb-6">{eyebrow}</p>}
          <h2 className="text-headline-sm">{headline}</h2>
          <p className="text-body-lg mx-auto mt-8 max-w-2xl">{body}</p>
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface SequenceItem {
  headline: string;
  subline: string;
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

  return (
    <motion.div
      style={{ opacity, y, scale, filter }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
    >
      <h2 className="text-headline">{item.headline}</h2>
      <p className="text-subhead mt-6 max-w-xl">{item.subline}</p>
    </motion.div>
  );
}

export function ScrollPinSequence({ items, height = "400vh" }: { items: SequenceItem[]; height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-5xl">
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
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/Button";
import { resolveHomeCurriculumTracks, type CurriculumTrack } from "@/lib/curriculum";
import { useHydrated } from "@/lib/use-hydrated";

const TRACK_SCROLL_VH = 100;

function TrackSlide({
  track,
  index,
  activeIndex,
}: {
  track: CurriculumTrack;
  index: number;
  activeIndex: number;
}) {
  const isActive = index === activeIndex;

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 24,
        scale: isActive ? 1 : 0.97,
        filter: isActive ? "blur(0px)" : "blur(8px)",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col justify-center"
      aria-hidden={!isActive}
    >
      <p className="text-eyebrow mb-4">{track.name}</p>
      <h3 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-[var(--text)]">
        {track.label}
      </h3>
      <p className="text-body-lg home-scroll-copy mt-4 max-w-xl">{track.desc}</p>
      <div className="mt-10 space-y-3">
        {track.steps.length > 0 ? (
          track.steps.map((step, i) => (
            <div
              key={`${step.title}-${i}`}
              className="flex items-center gap-4 border-b border-[var(--divider)] py-3"
            >
              <span className="text-caption w-6">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[1.0625rem] text-[var(--text)]">{step.title}</span>
            </div>
          ))
        ) : (
          <p className="text-body">항목이 없습니다</p>
        )}
      </div>
    </motion.div>
  );
}

function ProgressDots({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  return (
    <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === activeIndex ? 20 : 6,
            opacity: i === activeIndex ? 1 : 0.25,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="h-1.5 rounded-full bg-[var(--text)]"
        />
      ))}
    </div>
  );
}

export function CurriculumSection({ tracks }: { tracks: CurriculumTrack[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const snapLock = useRef(false);
  const hydrated = useHydrated();
  const displayTracks = resolveHomeCurriculumTracks(tracks);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 36,
    mass: 0.25,
  });

  const progressIndex = useTransform(smoothProgress, (value) =>
    Math.min(
      displayTracks.length - 1,
      Math.max(0, Math.round(value * Math.max(displayTracks.length - 1, 1))),
    ),
  );

  useMotionValueEvent(progressIndex, "change", (value) => {
    setActiveIndex(value);
  });

  useEffect(() => {
    const section = ref.current;
    if (!section || displayTracks.length <= 1) return;

    const trackCount = displayTracks.length;

    function getTrackHeight() {
      return (window.innerHeight * TRACK_SCROLL_VH) / 100;
    }

    function getCurrentIndex() {
      const sectionTop = section!.offsetTop;
      const relative = window.scrollY - sectionTop;
      const trackHeight = getTrackHeight();
      return Math.min(
        trackCount - 1,
        Math.max(0, Math.round(relative / trackHeight)),
      );
    }

    function snapTo(index: number) {
      const sectionTop = section!.offsetTop;
      const trackHeight = getTrackHeight();
      snapLock.current = true;
      window.scrollTo({
        top: sectionTop + index * trackHeight,
        behavior: "smooth",
      });
      window.setTimeout(() => {
        snapLock.current = false;
      }, 520);
    }

    function onWheel(event: WheelEvent) {
      if (snapLock.current) {
        event.preventDefault();
        return;
      }

      const rect = section!.getBoundingClientRect();
      const inSection = rect.top <= 0 && rect.bottom >= window.innerHeight * 0.5;
      if (!inSection) return;

      const delta = event.deltaY;
      if (Math.abs(delta) < 4) return;

      const current = getCurrentIndex();
      const next =
        delta > 0
          ? Math.min(trackCount - 1, current + 1)
          : Math.max(0, current - 1);

      if (next === current) return;

      const atFirst = current === 0 && delta < 0;
      const atLast = current === trackCount - 1 && delta > 0;
      if (atFirst || atLast) return;

      event.preventDefault();
      snapTo(next);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [displayTracks.length]);

  const sectionHeight = `${displayTracks.length * TRACK_SCROLL_VH}vh`;

  return (
    <section
      ref={ref}
      className="home-section home-section--curriculum curriculum-snap-section relative"
      style={{ height: sectionHeight }}
    >
      <div className="curriculum-snap-panel sticky top-0 h-[100svh] overflow-hidden">
        <div className="home-section-inner flex h-full items-center">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="lg:pr-8">
              <p className="text-eyebrow mb-4">커리큘럼</p>
              <h2 className="text-headline-sm">
                초급에서 고급까지
                <br />
                한 길로
              </h2>
              <p className="text-body-lg home-scroll-copy mt-6 max-w-md">
                3-Track 로드맵으로 어디서 시작해야 할지 고민하지 마세요
              </p>
              <div className="mt-10">
                <Button href="/curriculum" variant="text">
                  전체 커리큘럼 보기
                </Button>
              </div>
            </div>

            <div className="curriculum-stage relative h-[420px] lg:h-[480px]">
              {hydrated &&
                displayTracks.map((track, i) => (
                  <TrackSlide
                    key={track.slug}
                    track={track}
                    index={i}
                    activeIndex={activeIndex}
                  />
                ))}
              <ProgressDots total={displayTracks.length} activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
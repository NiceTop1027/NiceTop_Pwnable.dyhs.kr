"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/Button";
import { resolveHomeCurriculumTracks, type CurriculumTrack } from "@/lib/curriculum";
import { useHydrated } from "@/lib/use-hydrated";

function TrackSlide({
  track,
  index,
  total,
  scrollYProgress,
}: {
  track: CurriculumTrack;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const hydrated = useHydrated();
  const segment = 1 / total;
  const start = index * segment;
  const enter = start + segment * 0.15;
  const hold = start + segment * 0.55;
  const exit = start + segment * 0.85;
  const fadeEnd = Math.min(start + segment, 1);

  const opacity = useTransform(
    scrollYProgress,
    [start, enter, hold, exit, fadeEnd],
    [0, 1, 1, 1, 0],
  );
  const y = useTransform(scrollYProgress, [start, enter, exit], [80, 0, -40]);
  const scale = useTransform(scrollYProgress, [start, enter, exit], [0.94, 1, 0.97]);
  const blur = useTransform(
    scrollYProgress,
    [start, enter, exit, fadeEnd],
    [12, 0, 0, 10],
  );
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      style={hydrated ? { opacity, y, scale, filter } : undefined}
      className="absolute inset-0 flex flex-col justify-center"
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
  scrollYProgress,
}: {
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <ProgressDot key={i} index={i} total={total} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function ProgressDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const hydrated = useHydrated();
  const segment = 1 / total;
  const center = index * segment + segment * 0.4;
  const width = useTransform(
    scrollYProgress,
    [center - segment * 0.3, center, center + segment * 0.3],
    [6, 20, 6],
  );
  const opacity = useTransform(
    scrollYProgress,
    [center - segment * 0.3, center, center + segment * 0.3],
    [0.25, 1, 0.25],
  );

  return (
    <motion.div
      style={hydrated ? { width, opacity } : undefined}
      className="h-1.5 rounded-full bg-[var(--text)]"
    />
  );
}

export function CurriculumSection({ tracks }: { tracks: CurriculumTrack[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const displayTracks = resolveHomeCurriculumTracks(tracks);

  const sectionHeight = `${Math.max(360, displayTracks.length * 200)}vh`;

  return (
    <section ref={ref} className="home-section home-section--curriculum relative" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="home-section-inner flex h-full items-center">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left — 고정 */}
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

            {/* Right — 스크롤마다 트랙 전환 */}
            <div className="curriculum-stage relative h-[420px] lg:h-[480px]">
              {displayTracks.map((track, i) => (
                <TrackSlide
                  key={track.slug}
                  track={track}
                  index={i}
                  total={displayTracks.length}
                  scrollYProgress={scrollYProgress}
                />
              ))}
              <ProgressDots total={displayTracks.length} scrollYProgress={scrollYProgress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/pages/FadeIn";
import { CurriculumRichContent } from "@/components/notion/CurriculumRichContent";
import type { CurriculumTrack } from "@/lib/curriculum";

function TrackSection({ track }: { track: CurriculumTrack }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [60, 0]);

  return (
    <section ref={ref} className="border-t border-[var(--divider)] py-24">
      <motion.div style={{ opacity, y }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-eyebrow mb-2">{track.name}</p>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight text-[var(--text)]">
              {track.label} 트랙
            </h2>
          </div>
        </div>
        {track.content ? (
          <div className="notion-viewer-public mt-8 max-w-3xl">
            <CurriculumRichContent content={track.content} />
          </div>
        ) : (
          track.desc && <p className="text-body-lg mt-6 max-w-2xl">{track.desc}</p>
        )}
        <div className="mt-12">
          {track.steps.length > 0 ? (
            track.steps.map((step, i) => {
              const inner = (
                <>
                  <span className="text-caption w-8 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[1.0625rem] font-medium text-[var(--text)]">
                      {step.title}
                    </p>
                    {step.desc && <p className="text-body mt-1">{step.desc}</p>}
                  </div>
                </>
              );

              return step.href ? (
                <Link
                  key={`${step.title}-${i}`}
                  href={step.href}
                  className="feature-row group flex gap-6 !flex-row items-start"
                >
                  {inner}
                </Link>
              ) : (
                <div key={`${step.title}-${i}`} className="flex gap-6 border-b border-[var(--divider)] py-5">
                  {inner}
                </div>
              );
            })
          ) : (
            <p className="text-body py-8">아직 등록된 항목이 없습니다</p>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default function CurriculumContent({ tracks }: { tracks: CurriculumTrack[] }) {
  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="커리큘럼"
          description="Beginner → Intermediate → Advanced, 체계적인 학습 경로"
        />
      </FadeIn>

      {tracks.length > 0 ? (
        tracks.map((track) => <TrackSection key={track.slug} track={track} />)
      ) : (
        <FadeIn>
          <p className="text-body py-16 text-center">등록된 커리큘럼이 없습니다</p>
        </FadeIn>
      )}

      <FadeIn>
        <div className="border-t border-[var(--divider)] py-24 text-center">
          <h2 className="text-headline-sm">준비되셨나요?</h2>
          <p className="text-body-lg mx-auto mt-4 max-w-md">
            회원가입 후 학습을 시작하세요
          </p>
          <div className="mt-10">
            <Button href="/auth/register" variant="fill">
              시작하기
            </Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
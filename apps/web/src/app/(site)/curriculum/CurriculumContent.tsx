"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/pages/FadeIn";
import { DocumentContent } from "@/components/content/DocumentContent";
import { useAuth } from "@/providers/AuthProvider";
import type { CurriculumTrack } from "@/lib/curriculum";

function TrackCard({ track, index }: { track: CurriculumTrack; index: number }) {
  return (
    <article className="curriculum-track-card">
      <header className="curriculum-track-card-header">
        <span className="curriculum-track-index">{String(index + 1).padStart(2, "0")}</span>
        <div className="curriculum-track-card-heading">
          <p className="text-eyebrow">{track.name}</p>
          <h2 className="curriculum-track-title">{track.label} 트랙</h2>
        </div>
      </header>

      {track.desc && (
        <div className="curriculum-track-body">
          <DocumentContent content={track.desc} />
        </div>
      )}

      {track.steps.length > 0 ? (
        <ol className="curriculum-step-list">
          {track.steps.map((step, i) => {
            const content = (
              <>
                <span className="curriculum-step-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="curriculum-step-body">
                  <span className="curriculum-step-title">{step.title}</span>
                  {step.desc && <span className="curriculum-step-desc">{step.desc}</span>}
                </span>
                {step.href && <span className="curriculum-step-arrow" aria-hidden>›</span>}
              </>
            );

            return (
              <li key={`${step.title}-${i}`} className="curriculum-step">
                {step.href ? (
                  <Link href={step.href} className="curriculum-step-link">
                    {content}
                  </Link>
                ) : (
                  <div className="curriculum-step-link curriculum-step-link-static">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="curriculum-track-empty">아직 등록된 항목이 없습니다</p>
      )}
    </article>
  );
}

export default function CurriculumContent({ tracks }: { tracks: CurriculumTrack[] }) {
  const { user, isLoading } = useAuth();
  const firstLectureHref =
    tracks.flatMap((t) => t.steps).find((s) => s.href)?.href ?? "/wargame";

  return (
    <div className="curriculum-page">
      <FadeIn>
        <PageHeader
          title="커리큘럼"
          description="Markdown 강의와 3-Track 로드맵 — Beginner에서 Advanced까지"
        />
      </FadeIn>

      {tracks.length > 0 ? (
        <FadeIn delay={0.08}>
          <div className="curriculum-board">
            {tracks.map((track, i) => (
              <TrackCard key={track.slug} track={track} index={i} />
            ))}
          </div>
        </FadeIn>
      ) : (
        <FadeIn>
          <p className="text-body py-16 text-center">등록된 커리큘럼이 없습니다</p>
        </FadeIn>
      )}

      {!isLoading && (
        <FadeIn delay={0.12}>
          <div className="curriculum-cta">
            {user ? (
              <>
                <h2 className="text-headline-sm">학습을 이어가세요</h2>
                <p className="text-body-lg mx-auto mt-4 max-w-md">
                  {user.displayName ?? user.username}님, 커리큘럼에 맞춰 강의와 워게임을 진행해 보세요
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Button href={firstLectureHref} variant="fill">
                    첫 강의 시작
                  </Button>
                  <Button href="/wargame" variant="outline">
                    워게임 도전
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-headline-sm">준비되셨나요?</h2>
                <p className="text-body-lg mx-auto mt-4 max-w-md">
                  회원가입 후 학습을 시작하세요
                </p>
                <div className="mt-10">
                  <Button href="/auth?tab=register" variant="fill">
                    시작하기
                  </Button>
                </div>
              </>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
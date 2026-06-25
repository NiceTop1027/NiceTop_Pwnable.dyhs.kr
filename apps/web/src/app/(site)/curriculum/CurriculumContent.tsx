"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/pages/FadeIn";
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
          {track.desc && <p className="curriculum-track-desc">{track.desc}</p>}
        </div>
      </header>

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
          description="입문 · 중급 · 고급 단계별 학습 경로"
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
              <div className="curriculum-cta-row">
                <div className="curriculum-cta-copy">
                  <h2 className="curriculum-cta-title">학습을 이어가세요</h2>
                  <p className="curriculum-cta-text">
                    {`${user.displayName ?? user.username}님, 커리큘럼에 맞춰 강의와 워게임을 진행해 보세요`}
                  </p>
                </div>
                <div className="curriculum-cta-actions">
                  <Button href={firstLectureHref} variant="fill">
                    첫 강의 시작
                  </Button>
                  <Button href="/wargame" variant="outline">
                    워게임 도전
                  </Button>
                </div>
              </div>
            ) : (
              <div className="curriculum-cta-row">
                <div className="curriculum-cta-copy">
                  <h2 className="curriculum-cta-title">준비되셨나요?</h2>
                  <p className="curriculum-cta-text">회원가입 후 학습을 시작하세요</p>
                </div>
                <div className="curriculum-cta-actions">
                  <Button href="/auth?tab=register" variant="fill">
                    시작하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
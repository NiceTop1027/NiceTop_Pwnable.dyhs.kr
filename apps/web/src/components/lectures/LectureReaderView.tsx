"use client";

import Link from "next/link";
import type { LectureDetail } from "@/lib/api";
import { DocumentContent } from "@/components/content/DocumentContent";
import { FadeIn } from "@/components/pages/FadeIn";
import { LectureBottomNav } from "./LectureBottomNav";
import { LectureProgressProvider } from "./LectureProgressContext";
import { LectureTOC } from "./LectureTOC";

type LectureReaderViewProps = {
  lecture: LectureDetail;
};

export function LectureReaderView({ lecture }: LectureReaderViewProps) {
  const activeIndex = lecture.pages.findIndex(
    (page) => page.slug === lecture.page.slug,
  );
  const pageNumber = activeIndex >= 0 ? activeIndex + 1 : 1;
  const hasPages = lecture.pages.length > 1;

  const content = (
    <article className={`lecture-doc${hasPages ? " lecture-doc--multi" : ""}`}>
      <div className="lecture-doc-toolbar">
        <Link href="/curriculum" className="doc-back">
          <span className="doc-back-icon" aria-hidden>
            ‹
          </span>
          커리큘럼
        </Link>
      </div>

      <div className="lecture-doc-grid">
        {hasPages && (
          <LectureTOC
            lectureSlug={lecture.slug}
            pages={lecture.pages}
            activePageSlug={lecture.page.slug}
          />
        )}

        <div className="lecture-doc-main">
          <FadeIn>
            <header className="doc-header">
              <p className="doc-eyebrow">
                <span className="doc-eyebrow-dot" aria-hidden />
                {lecture.category.name}
              </p>

              <h1 className="doc-title">{lecture.page.title}</h1>

              {lecture.description && pageNumber === 1 && (
                <p className="doc-lead">{lecture.description}</p>
              )}
            </header>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="doc-body">
              <DocumentContent content={lecture.page.content} />
            </div>
          </FadeIn>

          {hasPages && (
            <FadeIn delay={0.12}>
              <LectureBottomNav
                lectureSlug={lecture.slug}
                pages={lecture.pages}
                activePageSlug={lecture.page.slug}
              />
            </FadeIn>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <LectureProgressProvider
      lectureSlug={lecture.slug}
      pageSlug={lecture.page.slug}
      totalPages={Math.max(lecture.pages.length, 1)}
      initialProgress={lecture.userProgress}
    >
      {content}
    </LectureProgressProvider>
  );
}
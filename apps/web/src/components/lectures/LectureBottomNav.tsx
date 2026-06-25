"use client";

import Link from "next/link";
import type { LecturePageSummary } from "@/lib/api";

type LectureBottomNavProps = {
  lectureSlug: string;
  pages: LecturePageSummary[];
  activePageSlug: string;
};

function pageHref(lectureSlug: string, pageSlug: string, isFirst: boolean) {
  return isFirst
    ? `/curriculum/${lectureSlug}`
    : `/curriculum/${lectureSlug}/${pageSlug}`;
}

export function LectureBottomNav({
  lectureSlug,
  pages,
  activePageSlug,
}: LectureBottomNavProps) {
  const activeIndex = pages.findIndex((page) => page.slug === activePageSlug);
  if (activeIndex < 0 || pages.length <= 1) return null;

  const prevPage = activeIndex > 0 ? pages[activeIndex - 1] : null;
  const nextPage =
    activeIndex < pages.length - 1 ? pages[activeIndex + 1] : null;

  if (!prevPage && !nextPage) return null;

  return (
    <nav className="lecture-nav" aria-label="페이지 이동">
      {prevPage ? (
        <Link
          href={pageHref(lectureSlug, prevPage.slug, activeIndex - 1 === 0)}
          className="lecture-nav-link lecture-nav-link--prev"
        >
          <span className="lecture-nav-label">이전</span>
          <span className="lecture-nav-title">{prevPage.title}</span>
        </Link>
      ) : (
        <span className="lecture-nav-spacer" aria-hidden />
      )}

      {nextPage ? (
        <Link
          href={pageHref(lectureSlug, nextPage.slug, activeIndex + 1 === 0)}
          className="lecture-nav-link lecture-nav-link--next"
        >
          <span className="lecture-nav-label">다음</span>
          <span className="lecture-nav-title">{nextPage.title}</span>
        </Link>
      ) : (
        <span className="lecture-nav-spacer" aria-hidden />
      )}
    </nav>
  );
}
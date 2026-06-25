"use client";

import Link from "next/link";
import type { LecturePageSummary } from "@/lib/api";
import { useLectureProgress } from "./LectureProgressContext";

type LectureTOCProps = {
  lectureSlug: string;
  pages: LecturePageSummary[];
  activePageSlug: string;
};

function pageHref(lectureSlug: string, pageSlug: string, isFirst: boolean) {
  return isFirst
    ? `/curriculum/${lectureSlug}`
    : `/curriculum/${lectureSlug}/${pageSlug}`;
}

export function LectureTOC({
  lectureSlug,
  pages,
  activePageSlug,
}: LectureTOCProps) {
  const { progress } = useLectureProgress();

  if (pages.length <= 1) return null;

  return (
    <aside className="lecture-toc" aria-label="목차">
      <nav>
        <ul className="lecture-toc-list">
          {pages.map((page, index) => {
            const href = pageHref(lectureSlug, page.slug, index === 0);
            const isActive = page.slug === activePageSlug;

            return (
              <li key={page.id}>
                <Link
                  href={href}
                  className={`lecture-toc-link${isActive ? " lecture-toc-link--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {page.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="lecture-toc-progress" aria-label="학습 진행도">
        <span className="lecture-toc-progress-text">
          {progress.visitedPageSlugs.length}/{pages.length}
        </span>
        <div className="lecture-toc-progress-track" aria-hidden>
          <span
            className="lecture-toc-progress-fill"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
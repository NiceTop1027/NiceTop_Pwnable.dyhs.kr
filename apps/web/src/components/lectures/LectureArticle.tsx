"use client";

import Link from "next/link";
import { FadeIn } from "@/components/pages/FadeIn";
import { DocumentContent } from "@/components/content/DocumentContent";

type LectureArticleProps = {
  title: string;
  description: string | null;
  category: string;
  content: string;
};

export function LectureArticle({
  title,
  description,
  category,
  content,
}: LectureArticleProps) {
  return (
    <article className="doc-page">
      <FadeIn>
        <header className="doc-header">
          <Link href="/curriculum" className="doc-back">
            ‹ 커리큘럼
          </Link>
          <p className="text-eyebrow mt-8">{category}</p>
          <h1 className="doc-title">{title}</h1>
          {description && <p className="doc-lead">{description}</p>}
        </header>
      </FadeIn>

      <FadeIn delay={0.08}>
        <DocumentContent content={content} />
      </FadeIn>
    </article>
  );
}
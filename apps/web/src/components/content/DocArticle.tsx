"use client";

import Link from "next/link";
import { FadeIn } from "@/components/pages/FadeIn";
import { DocumentContent } from "@/components/content/DocumentContent";

type DocArticleProps = {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  lead?: string | null;
  meta?: string;
  content: string;
};

export function DocArticle({
  backHref,
  backLabel,
  eyebrow,
  title,
  lead,
  meta,
  content,
}: DocArticleProps) {
  return (
    <article className="doc-page">
      <div className="doc-ambient" aria-hidden />

      <FadeIn>
        <header className="doc-header">
          <Link href={backHref} className="doc-back">
            <span className="doc-back-icon" aria-hidden>
              ‹
            </span>
            {backLabel}
          </Link>

          {eyebrow && (
            <p className="doc-eyebrow">
              <span className="doc-eyebrow-dot" aria-hidden />
              {eyebrow}
            </p>
          )}

          <h1 className="doc-title">{title}</h1>
          {lead && <p className="doc-lead">{lead}</p>}
          {meta && <p className="doc-meta">{meta}</p>}
        </header>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="doc-body">
          <DocumentContent content={content} />
        </div>
      </FadeIn>
    </article>
  );
}
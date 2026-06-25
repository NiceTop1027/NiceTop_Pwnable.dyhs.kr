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
      <FadeIn>
        <header className="doc-header">
          <Link href={backHref} className="doc-back">
            ‹ {backLabel}
          </Link>
          {eyebrow && <p className="text-eyebrow mt-8">{eyebrow}</p>}
          <h1 className="doc-title">{title}</h1>
          {lead && <p className="doc-lead">{lead}</p>}
          {meta && <p className="text-caption mt-4">{meta}</p>}
        </header>
      </FadeIn>

      <FadeIn delay={0.08}>
        <DocumentContent content={content} />
      </FadeIn>
    </article>
  );
}
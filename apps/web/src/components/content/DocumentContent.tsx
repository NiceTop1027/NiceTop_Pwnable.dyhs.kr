"use client";

import { MarkdownContent } from "@/components/content/MarkdownContent";
import { CurriculumRichContent } from "@/components/notion/CurriculumRichContent";

function isBlockContent(content: unknown): content is unknown[] {
  return Array.isArray(content) && content.length > 0;
}

export function DocumentContent({ content }: { content: unknown }) {
  if (typeof content === "string" && content.trim()) {
    return <MarkdownContent content={content} />;
  }

  if (isBlockContent(content)) {
    return <CurriculumRichContent content={content} />;
  }

  return null;
}
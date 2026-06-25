"use client";

import { MarkdownContent } from "@/components/content/MarkdownContent";
import { normalizeContentToMarkdown } from "@/lib/blocknote-markdown";

export function DocumentContent({ content }: { content: unknown }) {
  const markdown = normalizeContentToMarkdown(content);
  if (!markdown.trim()) return null;
  return <MarkdownContent content={markdown} />;
}
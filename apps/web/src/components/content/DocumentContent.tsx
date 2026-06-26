"use client";

import { NotionViewer } from "@/components/notion/NotionViewer";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { normalizeContentToMarkdown } from "@/lib/blocknote-markdown";
import { parseStoredBlocks } from "@/lib/content-text";

export function DocumentContent({ content }: { content: unknown }) {
  const blocks = parseStoredBlocks(content);

  if (blocks?.length) {
    return <NotionViewer content={blocks} />;
  }

  const markdown = normalizeContentToMarkdown(content);
  if (!markdown.trim()) return null;

  return <MarkdownContent content={markdown} />;
}
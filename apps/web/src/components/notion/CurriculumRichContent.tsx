"use client";

import dynamic from "next/dynamic";

const NotionViewer = dynamic(
  () =>
    import("./NotionViewer").then((mod) => ({ default: mod.NotionViewer })),
  { ssr: false },
);

export function CurriculumRichContent({ content }: { content: unknown }) {
  if (!Array.isArray(content) || content.length === 0) return null;
  return <NotionViewer content={content} />;
}
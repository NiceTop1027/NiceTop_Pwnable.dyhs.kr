"use client";

import "@blocknote/react/style.css";
import type { PartialBlock } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";

type NotionViewerProps = {
  content: unknown;
};

function toBlocks(content: unknown): PartialBlock[] | null {
  if (!Array.isArray(content) || content.length === 0) return null;
  return content as PartialBlock[];
}

export function NotionViewer({ content }: NotionViewerProps) {
  const blocks = toBlocks(content);
  if (!blocks) return null;

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent: blocks,
  });

  return (
    <div className="notion-viewer">
      <BlockNoteViewRaw
        editor={editor}
        theme="dark"
        editable={false}
        formattingToolbar={false}
        sideMenu={false}
        slashMenu={false}
      />
    </div>
  );
}
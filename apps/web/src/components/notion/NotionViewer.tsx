"use client";

import "@blocknote/react/style.css";
import type { PartialBlock } from "@blocknote/core";
import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import { blockNoteDictionary } from "@/lib/blocknote-dictionary";
import { documentBlockNoteSchema } from "@/lib/blocknote-schema";

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
    dictionary: blockNoteDictionary,
    schema: documentBlockNoteSchema,
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
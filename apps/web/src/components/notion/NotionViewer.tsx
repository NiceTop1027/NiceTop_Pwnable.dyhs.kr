"use client";

import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useCallback } from "react";
import { blockNoteDictionary } from "@/lib/blocknote-dictionary";
import { normalizeEditorBlocks } from "@/lib/blocknote-markdown";
import { documentBlockNoteSchema } from "@/lib/blocknote-schema";
import { parseStoredBlocks } from "@/lib/content-text";
import { resolveMediaUrl } from "@/lib/media";

type NotionViewerProps = {
  content: unknown;
};

function toBlocks(content: unknown): PartialBlock[] | null {
  const stored = parseStoredBlocks(content);
  if (!stored?.length) return null;
  return normalizeEditorBlocks(stored as PartialBlock[]);
}

export function NotionViewer({ content }: NotionViewerProps) {
  const blocks = toBlocks(content);
  if (!blocks) return null;

  const resolveFileUrl = useCallback(
    async (url: string) => resolveMediaUrl(url) ?? url,
    [],
  );

  const editor = useCreateBlockNote({
    dictionary: blockNoteDictionary,
    schema: documentBlockNoteSchema,
    initialContent: blocks,
    resolveFileUrl,
  });

  return (
    <div className="notion-viewer">
      <BlockNoteView
        editor={editor}
        theme="dark"
        editable={false}
        sideMenu={false}
        slashMenu={false}
        linkToolbar={false}
        filePanel={false}
        tableHandles={false}
        formattingToolbar={false}
      />
    </div>
  );
}
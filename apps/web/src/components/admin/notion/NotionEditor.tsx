"use client";

import "@blocknote/react/style.css";
import type { PartialBlock } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import { useCallback } from "react";

type NotionEditorProps = {
  initialContent?: PartialBlock[] | null;
  onChange?: (blocks: PartialBlock[]) => void;
  editable?: boolean;
};

const defaultBlocks: PartialBlock[] = [{ type: "paragraph", content: "" }];

export function NotionEditor({
  initialContent,
  onChange,
  editable = true,
}: NotionEditorProps) {
  const blocks =
    Array.isArray(initialContent) && initialContent.length > 0
      ? initialContent
      : defaultBlocks;

  const editor = useCreateBlockNote({
    dictionary: ko,
    initialContent: blocks,
  });

  const handleChange = useCallback(() => {
    onChange?.(editor.document);
  }, [editor, onChange]);

  return (
    <div className="notion-editor">
      <BlockNoteViewRaw
        editor={editor}
        theme="dark"
        editable={editable}
        onChange={handleChange}
        sideMenu={editable}
        formattingToolbar={editable}
        slashMenu={editable}
      />
    </div>
  );
}
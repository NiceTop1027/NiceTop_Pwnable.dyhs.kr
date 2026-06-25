"use client";

import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { FormattingToolbarController, useCreateBlockNote } from "@blocknote/react";
import { useCallback } from "react";
import { DocumentFormattingToolbar } from "./DocumentFormattingToolbar";

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
      <BlockNoteView
        editor={editor}
        theme="dark"
        editable={editable}
        onChange={handleChange}
        sideMenu={editable}
        slashMenu={editable}
        linkToolbar={editable}
        formattingToolbar={false}
        emojiPicker={false}
        comments={false}
      >
        {editable && (
          <FormattingToolbarController
            formattingToolbar={DocumentFormattingToolbar}
          />
        )}
      </BlockNoteView>
    </div>
  );
}
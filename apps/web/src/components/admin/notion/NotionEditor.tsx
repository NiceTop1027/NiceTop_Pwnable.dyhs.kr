"use client";

import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { FormattingToolbarController, useCreateBlockNote } from "@blocknote/react";
import { useCallback } from "react";
import { adminApi } from "@/lib/api";
import { documentBlockNoteSchema } from "@/lib/blocknote-schema";
import { resolveMediaUrl } from "@/lib/media";
import { getAccessToken } from "@/providers/AuthProvider";
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

  const uploadFile = useCallback(async (file: File) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error("로그인이 필요합니다");
    }

    const { url } = await adminApi.uploadContentImage(token, file);
    return {
      props: {
        name: file.name,
        url,
        showPreview: true,
      },
    };
  }, []);

  const resolveFileUrl = useCallback(
    async (url: string) => resolveMediaUrl(url) ?? url,
    [],
  );

  const editor = useCreateBlockNote({
    dictionary: ko,
    schema: documentBlockNoteSchema,
    initialContent: blocks,
    uploadFile,
    resolveFileUrl,
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
        filePanel={editable}
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
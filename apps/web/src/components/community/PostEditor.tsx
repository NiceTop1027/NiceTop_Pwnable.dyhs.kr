"use client";

import type { PartialBlock } from "@blocknote/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DocumentEditorShell,
  type SaveState,
} from "@/components/admin/DocumentEditorShell";
import { api, ApiError } from "@/lib/api";
import {
  blocksToMarkdown,
  parseMarkdownToBlocks,
} from "@/lib/blocknote-markdown";
import { useAuth  } from "@/providers/AuthProvider";

type PostEditorProps = {
  boardSlug: string;
  boardName: string;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
};

export function PostEditor({
  boardSlug,
  boardName,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
}: PostEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(() =>
    parseMarkdownToBlocks(initialContent),
  );
  const [editorKey, setEditorKey] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isDirty, setIsDirty] = useState(mode === "create");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit") {
      setTitle(initialTitle);
      setBlocks(parseMarkdownToBlocks(initialContent));
      setEditorKey((k) => k + 1);
      setIsDirty(false);
    }
  }, [initialContent, initialTitle, mode]);

  const save = useCallback(async () => {
    setError("");
    const trimmedTitle = title.trim() || "제목 없음";
    const content = blocksToMarkdown(blocks ?? []).trim();

    if (!content) {
      setError("본문을 입력해 주세요.");
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    try {
      if (mode === "create") {
        const post = await api.createBoardPost(boardSlug, {
          title: trimmedTitle,
          content,
        });
        setIsDirty(false);
        setSaveState("saved");
        router.push(`/community/${boardSlug}/${post.id}`);
        router.refresh();
        return;
      }

      if (postId) {
        await api.updateBoardPost(boardSlug, postId, {
          title: trimmedTitle,
          content,
        });
        setIsDirty(false);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      }
    } catch (err) {
      setSaveState("error");
      setError(
        err instanceof ApiError ? err.message : "저장에 실패했습니다.",
      );
    }
  }, [blocks, boardSlug, mode, postId, router, title]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDirty, save]);

  async function handleDelete() {
    if (!postId || !confirm("게시글을 삭제할까요?")) return;
    await api.deleteBoardPost(boardSlug, postId);
    router.push(`/community/${boardSlug}`);
    router.refresh();
  }

  if (!user) {
    return (
      <div className="board-auth-gate">
        <p>글을 작성하려면 로그인이 필요합니다.</p>
        <Button
          href={`/auth?next=/community/${boardSlug}/${mode === "create" ? "new" : `${postId}/edit`}`}
          variant="fill"
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="board-editor-error board-editor-error--floating">
          {error}
        </p>
      )}
      <DocumentEditorShell
        backHref={`/community/${boardSlug}`}
        title={title}
        onTitleChange={(value) => {
          setTitle(value);
          setIsDirty(true);
        }}
        titlePlaceholder="제목 없음"
        titleAriaLabel={`${boardName} 게시글 제목`}
        blocks={blocks}
        editorKey={editorKey}
        onBlocksChange={(next) => {
          setBlocks(next);
          setIsDirty(true);
        }}
        saveState={saveState}
        isDirty={isDirty}
        onSave={save}
        onDelete={mode === "edit" && postId ? handleDelete : undefined}
        previewHref={
          mode === "edit" && postId
            ? `/community/${boardSlug}/${postId}`
            : undefined
        }
        footer={
          <p className="board-editor-board-label">{boardName}</p>
        }
      />
    </>
  );
}
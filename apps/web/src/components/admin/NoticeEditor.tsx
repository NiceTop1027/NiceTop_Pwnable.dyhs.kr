"use client";

import type { PartialBlock } from "@blocknote/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminNotice } from "@/lib/api";
import { blocksToMarkdown, parseMarkdownToBlocks } from "@/lib/blocknote-markdown";
import {
  DocumentEditorShell,
  type SaveState,
} from "./DocumentEditorShell";

export function NoticeEditor({ noticeId }: { noticeId: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [title, setTitle] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {

    adminApi
      .getNotice( noticeId)
      .then((data) => {
        setNotice(data);
        setTitle(data.title);
        setIsPinned(data.isPinned);
        setBlocks(parseMarkdownToBlocks(data.content));
        setEditorKey((k) => k + 1);
        setIsDirty(false);
      })
      .catch(() => setNotice(null))
      .finally(() => setLoading(false));
  }, [noticeId]);

  const save = useCallback(async () => {
    if (!notice) return;

    setSaveState("saving");
    try {
      const content = JSON.stringify(blocks ?? []);
      const updated = await adminApi.updateNotice( noticeId, {
        title: title.trim() || "제목 없음",
        content,
        isPinned,
      });
      setNotice(updated);
      setIsDirty(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [blocks, isPinned, notice, noticeId, title]);

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
    if (!confirm("이 공지를 삭제할까요?")) return;
    await adminApi.deleteNotice( noticeId);
    router.push("/admin/notices");
  }

  return (
    <DocumentEditorShell
      backHref="/admin/notices"
      title={title}
      onTitleChange={(v) => {
        setTitle(v);
        setIsDirty(true);
      }}
      blocks={blocks}
      editorKey={editorKey}
      onBlocksChange={(next) => {
        setBlocks(next);
        setIsDirty(true);
      }}
      saveState={saveState}
      isDirty={isDirty}
      onSave={save}
      onDelete={handleDelete}
      previewHref={notice ? `/notices/${notice.id}` : undefined}
      loading={loading}
      notFound={!loading && !notice}
      emptyMessage="공지를 찾을 수 없습니다"
      toolbar={
        <label className="notion-toolbar-check">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => {
              setIsPinned(e.target.checked);
              setIsDirty(true);
            }}
          />
          상단 고정
        </label>
      }
    />
  );
}
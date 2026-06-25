"use client";

import type { PartialBlock } from "@blocknote/core";
import { ArrowLeft, Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, type AdminLecture } from "@/lib/api";
import { blocksToMarkdown, parseMarkdownToBlocks } from "@/lib/blocknote-markdown";
import { getAccessToken } from "@/providers/AuthProvider";
import { NotionEditor } from "./notion/NotionEditor";
import { AdminButton } from "./ui/AdminButton";

type Category = { id: string; name: string; slug: string };

type SaveState = "idle" | "saving" | "saved" | "error";

export function LectureEditor({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const [lecture, setLecture] = useState<AdminLecture | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    Promise.all([
      adminApi.lectureCategories(token),
      adminApi.getLecture(token, lectureId),
    ])
      .then(([cats, data]) => {
        setCategories(cats);
        setLecture(data);
        setTitle(data.title);
        setDescription(data.description ?? "");
        setCategoryId(data.categoryId);
        setIsPublished(data.isPublished);
        setBlocks(parseMarkdownToBlocks(data.content));
        setEditorKey((k) => k + 1);
      })
      .catch(() => setLecture(null))
      .finally(() => setLoading(false));
  }, [lectureId]);

  const save = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !lecture) return;

    setSaveState("saving");
    try {
      const content = blocksToMarkdown(blocks ?? []);
      const updated = await adminApi.updateLecture(token, lectureId, {
        title: title.trim() || "제목 없음",
        description: description.trim() || undefined,
        categoryId,
        content,
        isPublished,
      });
      setLecture(updated);
      dirtyRef.current = false;
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [blocks, categoryId, description, isPublished, lecture, lectureId, title]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirtyRef.current) save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  async function handleDelete() {
    if (!confirm("이 문서를 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteLecture(token, lectureId);
    router.push("/admin/curriculum");
  }

  if (loading) {
    return (
      <div className="notion-page">
        <div className="admin-loading">
          <span className="admin-spinner" />
          문서 불러오는 중
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="notion-page">
        <div className="notion-toolbar">
          <Link href="/admin/curriculum" className="notion-toolbar-back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            목록
          </Link>
        </div>
        <p className="notion-empty">문서를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="notion-page">
      <header className="notion-toolbar">
        <Link href="/admin/curriculum" className="notion-toolbar-back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          목록
        </Link>

        <div className="notion-toolbar-actions">
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              dirtyRef.current = true;
            }}
            className="notion-toolbar-select"
            aria-label="카테고리"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="notion-toolbar-check">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => {
                setIsPublished(e.target.checked);
                dirtyRef.current = true;
              }}
            />
            공개
          </label>

          <span className="notion-toolbar-status">
            {saveState === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                저장 중
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="h-3.5 w-3.5" />
                저장됨
              </>
            )}
            {saveState === "error" && "저장 실패"}
            {saveState === "idle" && dirtyRef.current && "수정됨"}
          </span>

          {isPublished && (
            <Link
              href={`/curriculum/${lecture.slug}`}
              target="_blank"
              className="admin-btn admin-btn-ghost"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              미리보기
            </Link>
          )}

          <AdminButton
            variant="primary"
            onClick={save}
            disabled={saveState === "saving"}
          >
            저장
          </AdminButton>

          <AdminButton variant="danger" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            삭제
          </AdminButton>
        </div>
      </header>

      <article className="notion-document">
        <input
          className="notion-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            dirtyRef.current = true;
          }}
          placeholder="제목 없음"
          aria-label="강의 제목"
        />
        <input
          className="notion-subtitle"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            dirtyRef.current = true;
          }}
          placeholder="한 줄 설명 (선택)"
          aria-label="강의 설명"
        />
        <p className="notion-hint">
          <kbd>/</kbd> 로 블록 추가 · 저장 시 Markdown으로 게시됩니다 ·{" "}
          <kbd>⌘</kbd>+<kbd>S</kbd> 저장
        </p>
        <NotionEditor
          key={editorKey}
          initialContent={blocks}
          onChange={(next) => {
            setBlocks(next);
            dirtyRef.current = true;
          }}
        />
      </article>
    </div>
  );
}
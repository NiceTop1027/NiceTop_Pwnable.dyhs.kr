"use client";

import type { PartialBlock } from "@blocknote/core";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, type AdminCurriculum } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { NotionEditor } from "./notion/NotionEditor";
import { AdminButton } from "./ui/AdminButton";

const tiers = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

type SaveState = "idle" | "saving" | "saved" | "error";

export function CurriculumEditor({ curriculumId }: { curriculumId: string }) {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<AdminCurriculum | null>(null);
  const [title, setTitle] = useState("");
  const [tier, setTier] = useState<string>("BEGINNER");
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    adminApi
      .getCurriculum(token, curriculumId)
      .then((data) => {
        setCurriculum(data);
        setTitle(data.title);
        setTier(data.tier);
        setBlocks(
          Array.isArray(data.content) && data.content.length > 0
            ? (data.content as PartialBlock[])
            : null,
        );
        setEditorKey((k) => k + 1);
      })
      .catch(() => setCurriculum(null))
      .finally(() => setLoading(false));
  }, [curriculumId]);

  const save = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !curriculum) return;

    setSaveState("saving");
    try {
      const updated = await adminApi.updateCurriculum(token, curriculumId, {
        title: title.trim() || "제목 없음",
        tier,
        content: blocks ?? [],
      });
      setCurriculum(updated);
      dirtyRef.current = false;
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [blocks, curriculum, curriculumId, tier, title]);

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
    if (!confirm("이 커리큘럼을 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteCurriculum(token, curriculumId);
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

  if (!curriculum) {
    return (
      <div className="notion-page">
        <div className="notion-toolbar">
          <Link href="/admin/curriculum" className="notion-toolbar-back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            목록
          </Link>
        </div>
        <p className="notion-empty">커리큘럼을 찾을 수 없습니다</p>
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
            value={tier}
            onChange={(e) => {
              setTier(e.target.value);
              dirtyRef.current = true;
            }}
            className="notion-toolbar-select"
            aria-label="난이도"
          >
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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
          aria-label="커리큘럼 제목"
        />
        <p className="notion-hint">
          <kbd>/</kbd> 로 블록을 추가하세요 · 굵게, 기울임, 제목, 목록, 코드 블록 등 Notion과 동일하게
          작성됩니다
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
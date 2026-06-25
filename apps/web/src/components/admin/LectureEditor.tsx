"use client";

import type { PartialBlock } from "@blocknote/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, api, ApiError, type AdminLecture } from "@/lib/api";
import { blocksToMarkdown, parseMarkdownToBlocks } from "@/lib/blocknote-markdown";
import {
  DocumentEditorShell,
  type SaveState,
} from "./DocumentEditorShell";
import { LecturePageNav } from "@/components/lectures/LecturePageNav";

type Category = { id: string; name: string; slug: string };

type PageDraft = {
  id: string;
  title: string;
  slug: string;
  blocks: PartialBlock[] | null;
  order: number;
};

function createPageDraft(order: number): PageDraft {
  const id = `new-${crypto.randomUUID()}`;
  return {
    id,
    title: `페이지 ${order + 1}`,
    slug: "",
    blocks: parseMarkdownToBlocks(""),
    order,
  };
}

function toPageDrafts(lecture: AdminLecture): PageDraft[] {
  return lecture.pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    blocks: parseMarkdownToBlocks(page.content),
    order: page.order,
  }));
}

export function LectureEditor({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const [lecture, setLecture] = useState<AdminLecture | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [pages, setPages] = useState<PageDraft[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLecture() {
      try {
        const cats = await adminApi.lectureCategories();
        if (cancelled) return;

        let data: AdminLecture;
        try {
          data = await adminApi.getLecture(lectureId);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await api.refresh();
            data = await adminApi.getLecture(lectureId);
          } else {
            throw error;
          }
        }

        if (cancelled) return;

        setCategories(cats);
        setLecture(data);
        setTitle(data.title);
        setDescription(data.description ?? "");
        setCategoryId(data.categoryId);
        setIsPublished(data.isPublished);
        const drafts = toPageDrafts(data);
        setPages(drafts);
        setActivePageId(drafts[0]?.id ?? null);
        setEditorKey((k) => k + 1);
        setIsDirty(false);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace(`/auth/login?next=${encodeURIComponent(`/admin/curriculum/${lectureId}`)}`);
          return;
        }
        setLecture(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLecture();

    return () => {
      cancelled = true;
    };
  }, [lectureId, router]);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0] ?? null,
    [activePageId, pages],
  );

  const activePageIndex = useMemo(
    () => pages.findIndex((page) => page.id === activePage?.id),
    [activePage?.id, pages],
  );

  const previewHref =
    isPublished && lecture && activePage
      ? activePageIndex <= 0
        ? `/curriculum/${lecture.slug}`
        : `/curriculum/${lecture.slug}/${activePage.slug}`
      : undefined;

  const save = useCallback(async () => {
    if (!lecture || pages.length === 0) return;

    setSaveState("saving");
    try {
      const updated = await adminApi.updateLecture(lectureId, {
        title: title.trim() || "제목 없음",
        description: description.trim() || undefined,
        categoryId,
        isPublished,
        pages: pages.map((page, index) => ({
          id: page.id.startsWith("new-") ? undefined : page.id,
          title: page.title.trim() || `페이지 ${index + 1}`,
          slug: page.slug || undefined,
          content: blocksToMarkdown(page.blocks ?? []),
          order: index,
        })),
      });
      const drafts = toPageDrafts(updated);
      setLecture(updated);
      setPages(drafts);
      setActivePageId((current) => {
        if (!current) return drafts[0]?.id ?? null;
        const sameDraft = drafts.find(
          (page, index) =>
            pages.findIndex((draft) => draft.id === current) === index,
        );
        return sameDraft?.id ?? drafts[0]?.id ?? null;
      });
      setEditorKey((k) => k + 1);
      setIsDirty(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [categoryId, description, isPublished, lecture, lectureId, pages, title]);

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

  function handleAddPage() {
    const next = createPageDraft(pages.length);
    setPages((current) => [...current, next]);
    setActivePageId(next.id);
    setEditorKey((k) => k + 1);
    setIsDirty(true);
  }

  function handleDeletePage(pageId: string) {
    if (pages.length <= 1) return;
    if (!confirm("이 페이지를 삭제할까요?")) return;

    const nextPages = pages
      .filter((page) => page.id !== pageId)
      .map((page, index) => ({ ...page, order: index }));

    setPages(nextPages);
    if (activePageId === pageId) {
      setActivePageId(nextPages[0]?.id ?? null);
      setEditorKey((k) => k + 1);
    }
    setIsDirty(true);
  }

  function handleRenamePage(pageId: string, nextTitle: string) {
    setPages((current) =>
      current.map((page) =>
        page.id === pageId ? { ...page, title: nextTitle } : page,
      ),
    );
    setIsDirty(true);
  }

  function handleSelectPage(pageId: string) {
    if (pageId === activePageId) return;
    setActivePageId(pageId);
    setEditorKey((k) => k + 1);
  }

  async function handleDelete() {
    if (!confirm("이 문서를 삭제할까요?")) return;
    await adminApi.deleteLecture(lectureId);
    router.push("/admin/curriculum");
  }

  if (loading || !lecture || !activePage) {
    return (
      <DocumentEditorShell
        backHref="/admin/curriculum"
        title=""
        onTitleChange={() => {}}
        blocks={null}
        editorKey={0}
        onBlocksChange={() => {}}
        saveState={saveState}
        isDirty={isDirty}
        onSave={save}
        loading={loading}
        notFound={!loading && !lecture}
      />
    );
  }

  return (
    <div className="lecture-editor">
      <LecturePageNav
        lectureTitle={title || "제목 없음"}
        pages={pages}
        activePageId={activePage.id}
        onSelectPage={handleSelectPage}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        onRenamePage={handleRenamePage}
        backHref="/admin/curriculum"
      />

      <div className="lecture-editor-main">
        <DocumentEditorShell
          backHref="/admin/curriculum"
          showBackLink={false}
          title={activePage.title}
          onTitleChange={(value) => handleRenamePage(activePage.id, value)}
          subtitle={description}
          onSubtitleChange={(value) => {
            setDescription(value);
            setIsDirty(true);
          }}
          subtitlePlaceholder="강의 한 줄 설명 (선택)"
          titlePlaceholder="페이지 제목"
          titleAriaLabel="페이지 제목"
          subtitleAriaLabel="강의 설명"
          blocks={activePage.blocks}
          editorKey={editorKey}
          onBlocksChange={(next) => {
            setPages((current) =>
              current.map((page) =>
                page.id === activePage.id ? { ...page, blocks: next } : page,
              ),
            );
            setIsDirty(true);
          }}
          saveState={saveState}
          isDirty={isDirty}
          onSave={save}
          onDelete={handleDelete}
          previewHref={previewHref}
          toolbar={
            <>
              <input
                className="notion-toolbar-input notion-toolbar-input-wide"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="강의 제목"
                aria-label="강의 제목"
              />

              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsDirty(true);
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
                    setIsDirty(true);
                  }}
                />
                공개
              </label>
            </>
          }
        />
      </div>
    </div>
  );
}
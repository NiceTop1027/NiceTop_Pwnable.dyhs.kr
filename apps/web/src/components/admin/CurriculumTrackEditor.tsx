"use client";

import type { PartialBlock } from "@blocknote/core";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApi,
  type AdminCurriculum,
  type AdminCurriculumItem,
} from "@/lib/api";
import { blocksToMarkdown, parseMarkdownToBlocks } from "@/lib/blocknote-markdown";
import { CURRICULUM_TIER_OPTIONS } from "@/lib/curriculum";
import { getAccessToken } from "@/providers/AuthProvider";
import {
  DocumentEditorShell,
  type SaveState,
} from "./DocumentEditorShell";

type LectureOption = { id: string; title: string; slug: string };
type ChallengeOption = { id: string; title: string; slug: string };

export function CurriculumTrackEditor({ trackId }: { trackId: string }) {
  const router = useRouter();
  const [track, setTrack] = useState<AdminCurriculum | null>(null);
  const [lectures, setLectures] = useState<LectureOption[]>([]);
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [title, setTitle] = useState("");
  const [tier, setTier] = useState("BEGINNER");
  const [order, setOrder] = useState(1);
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [itemsBusy, setItemsBusy] = useState(false);

  const reloadTrack = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return null;
    const data = await adminApi.getCurriculum(token, trackId);
    setTrack(data);
    return data;
  }, [trackId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    Promise.all([
      adminApi.lectures(token),
      adminApi.challenges(token),
      adminApi.getCurriculum(token, trackId),
    ])
      .then(([lectureList, challengeList, data]) => {
        setLectures(lectureList as LectureOption[]);
        setChallenges(challengeList as ChallengeOption[]);
        setTrack(data);
        setTitle(data.title);
        setTier(data.tier);
        setOrder(data.order);
        setBlocks(parseMarkdownToBlocks(data.description ?? ""));
        setEditorKey((k) => k + 1);
        setIsDirty(false);
      })
      .catch(() => setTrack(null))
      .finally(() => setLoading(false));
  }, [trackId]);

  const usedLectureIds = useMemo(
    () => new Set(track?.items.map((item) => item.lecture?.id).filter(Boolean)),
    [track?.items],
  );
  const usedChallengeIds = useMemo(
    () => new Set(track?.items.map((item) => item.challenge?.id).filter(Boolean)),
    [track?.items],
  );

  const availableLectures = lectures.filter((l) => !usedLectureIds.has(l.id));
  const availableChallenges = challenges.filter((c) => !usedChallengeIds.has(c.id));

  const save = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !track) return;

    setSaveState("saving");
    try {
      const description = blocksToMarkdown(blocks ?? []);
      const updated = await adminApi.updateCurriculum(token, trackId, {
        title: title.trim() || "입문",
        tier,
        order,
        description,
      });
      setTrack(updated);
      setIsDirty(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [blocks, order, tier, title, track, trackId]);

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
    if (!confirm("이 트랙을 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteCurriculum(token, trackId);
    router.push("/admin/curriculum");
  }

  async function addItem(type: "lecture" | "challenge") {
    const token = getAccessToken();
    if (!token || !track) return;

    const lectureId = type === "lecture" ? selectedLectureId : undefined;
    const challengeId = type === "challenge" ? selectedChallengeId : undefined;
    if (!lectureId && !challengeId) return;

    setItemsBusy(true);
    try {
      await adminApi.addCurriculumItem(token, trackId, { lectureId, challengeId });
      await reloadTrack();
      if (type === "lecture") setSelectedLectureId("");
      if (type === "challenge") setSelectedChallengeId("");
    } finally {
      setItemsBusy(false);
    }
  }

  async function removeItem(itemId: string) {
    const token = getAccessToken();
    if (!token || !track) return;

    setItemsBusy(true);
    try {
      await adminApi.deleteCurriculumItem(token, trackId, itemId);
      await reloadTrack();
    } finally {
      setItemsBusy(false);
    }
  }

  async function moveItem(item: AdminCurriculumItem, direction: -1 | 1) {
    const token = getAccessToken();
    if (!token || !track) return;

    const index = track.items.findIndex((entry) => entry.id === item.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= track.items.length) return;

    const itemIds = track.items.map((entry) => entry.id);
    [itemIds[index], itemIds[target]] = [itemIds[target], itemIds[index]];

    setItemsBusy(true);
    try {
      const updated = await adminApi.reorderCurriculumItems(token, trackId, itemIds);
      setTrack(updated);
    } finally {
      setItemsBusy(false);
    }
  }

  function itemLabel(item: AdminCurriculumItem) {
    if (item.lecture) return `강의 · ${item.lecture.title}`;
    if (item.challenge) return `문제 · ${item.challenge.title}`;
    return "항목";
  }

  return (
    <DocumentEditorShell
      backHref="/admin/curriculum"
      title={title}
      onTitleChange={(value) => {
        setTitle(value);
        setIsDirty(true);
      }}
      titlePlaceholder="입문"
      titleAriaLabel="트랙 표시 이름"
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
      previewHref="/curriculum"
      loading={loading}
      notFound={!loading && !track}
      emptyMessage="트랙을 찾을 수 없습니다"
      loadingMessage="트랙 불러오는 중"
      toolbar={
        <>
          <select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value);
              setIsDirty(true);
            }}
            className="notion-toolbar-select"
            aria-label="티어"
          >
            {CURRICULUM_TIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="notion-toolbar-check">
            순서
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => {
                setOrder(Number(e.target.value) || 1);
                setIsDirty(true);
              }}
              className="notion-toolbar-input"
              aria-label="표시 순서"
            />
          </label>
        </>
      }
      footer={
        <section className="curriculum-track-items-panel">
          <div className="curriculum-track-items-header">
            <h2 className="curriculum-track-items-title">학습 단계</h2>
            <p className="curriculum-track-items-desc">
              공개 커리큘럼 페이지에 표시되는 01, 02 단계 목록입니다
            </p>
          </div>

          {track && track.items.length > 0 ? (
            <ol className="curriculum-track-items-list">
              {track.items.map((item, index) => (
                <li key={item.id} className="curriculum-track-item-row">
                  <span className="curriculum-track-item-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="curriculum-track-item-label">{itemLabel(item)}</span>
                  <div className="curriculum-track-item-actions">
                    <button
                      type="button"
                      className="curriculum-track-item-btn"
                      onClick={() => moveItem(item, -1)}
                      disabled={itemsBusy || index === 0}
                      aria-label="위로"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="curriculum-track-item-btn"
                      onClick={() => moveItem(item, 1)}
                      disabled={itemsBusy || index === track.items.length - 1}
                      aria-label="아래로"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="curriculum-track-item-btn curriculum-track-item-btn-danger"
                      onClick={() => removeItem(item.id)}
                      disabled={itemsBusy}
                      aria-label="삭제"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="curriculum-track-items-empty">등록된 단계가 없습니다</p>
          )}

          <div className="curriculum-track-items-add">
            <div className="curriculum-track-items-add-row">
              <select
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
                className="notion-toolbar-select notion-toolbar-input-wide"
                aria-label="추가할 강의"
              >
                <option value="">강의 문서 선택</option>
                {availableLectures.map((lecture) => (
                  <option key={lecture.id} value={lecture.id}>
                    {lecture.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="notion-btn notion-btn-ghost"
                onClick={() => addItem("lecture")}
                disabled={itemsBusy || !selectedLectureId}
              >
                <Plus className="h-3.5 w-3.5" />
                강의 추가
              </button>
            </div>

            <div className="curriculum-track-items-add-row">
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="notion-toolbar-select notion-toolbar-input-wide"
                aria-label="추가할 문제"
              >
                <option value="">워게임 문제 선택</option>
                {availableChallenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="notion-btn notion-btn-ghost"
                onClick={() => addItem("challenge")}
                disabled={itemsBusy || !selectedChallengeId}
              >
                <Plus className="h-3.5 w-3.5" />
                문제 추가
              </button>
            </div>
          </div>
        </section>
      }
    />
  );
}
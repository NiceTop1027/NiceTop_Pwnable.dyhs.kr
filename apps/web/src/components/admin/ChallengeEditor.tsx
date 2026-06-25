"use client";

import type { PartialBlock } from "@blocknote/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminChallenge } from "@/lib/api";
import { blocksToMarkdown, parseMarkdownToBlocks } from "@/lib/blocknote-markdown";
import {
  DocumentEditorShell,
  type SaveState,
} from "./DocumentEditorShell";

const categories = ["PWN", "REV", "WEB", "CRYPTO", "FORENSIC", "MISC", "OSINT"];
const difficulties = ["EASY", "MEDIUM", "HARD", "INSANE"];

export function ChallengeEditor({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<AdminChallenge | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PWN");
  const [difficulty, setDifficulty] = useState("EASY");
  const [points, setPoints] = useState(100);
  const [flag, setFlag] = useState("");
  const [dockerImage, setDockerImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<PartialBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorKey, setEditorKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {

    adminApi
      .getChallenge( challengeId)
      .then((data) => {
        setChallenge(data);
        setTitle(data.title);
        setCategory(data.category);
        setDifficulty(data.difficulty);
        setPoints(data.points);
        setDockerImage(data.dockerImage ?? "");
        setIsPublished(data.isPublished);
        setBlocks(parseMarkdownToBlocks(data.description));
        setEditorKey((k) => k + 1);
        setIsDirty(false);
      })
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [challengeId]);

  const save = useCallback(async () => {
    if (!challenge) return;

    setSaveState("saving");
    try {
      const description = blocksToMarkdown(blocks ?? []);
      const updated = await adminApi.updateChallenge( challengeId, {
        title: title.trim() || "제목 없음",
        description,
        category,
        difficulty,
        points,
        dockerImage: dockerImage.trim() || undefined,
        isPublished,
        ...(flag.trim() ? { flag: flag.trim() } : {}),
      });
      setChallenge(updated);
      setFlag("");
      setIsDirty(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [
    blocks,
    category,
    challenge,
    challengeId,
    difficulty,
    dockerImage,
    flag,
    isPublished,
    points,
    title,
  ]);

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
    if (!confirm("이 문제를 삭제할까요?")) return;
    await adminApi.deleteChallenge( challengeId);
    router.push("/admin/challenges");
  }

  return (
    <DocumentEditorShell
      backHref="/admin/challenges"
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
      previewHref={
        isPublished && challenge ? `/wargame/${challenge.slug}` : undefined
      }
      loading={loading}
      notFound={!loading && !challenge}
      emptyMessage="문제를 찾을 수 없습니다"
      toolbar={
        <>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setIsDirty(true);
            }}
            className="notion-toolbar-select"
            aria-label="카테고리"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setIsDirty(true);
            }}
            className="notion-toolbar-select"
            aria-label="난이도"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => {
              setPoints(Number(e.target.value));
              setIsDirty(true);
            }}
            className="notion-toolbar-select notion-toolbar-input"
            aria-label="기본 점수"
            title="기본 점수"
          />

          <input
            type="text"
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value);
              setIsDirty(true);
            }}
            placeholder="FLAG 변경 시만 입력"
            className="notion-toolbar-select notion-toolbar-input notion-toolbar-input-wide"
            aria-label="FLAG"
          />

          <input
            type="text"
            value={dockerImage}
            onChange={(e) => {
              setDockerImage(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Docker 이미지"
            className="notion-toolbar-select notion-toolbar-input notion-toolbar-input-wide"
            aria-label="Docker 이미지"
          />

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
  );
}
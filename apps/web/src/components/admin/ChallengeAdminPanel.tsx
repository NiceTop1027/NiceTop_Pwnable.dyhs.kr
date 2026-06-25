"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminAlert } from "./ui/AdminAlert";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import {
  AdminCheckbox,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "./ui/AdminField";
import { AdminRow } from "./ui/AdminRow";
import { calcChallengeXp } from "@/lib/challenge-xp";

type ChallengeRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  points: number;
  isPublished: boolean;
  _count: { solves: number };
};

const categories = ["PWN", "REV", "WEB", "CRYPTO", "FORENSIC", "MISC", "OSINT"];

export function ChallengeAdminPanel() {
  const [items, setItems] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    const data = (await adminApi.challenges(token)) as ChallengeRow[];
    setItems(data);
  }

  useEffect(() => {
    load()
      .catch(() => setItems([]))
      .finally(() => setListLoading(false));
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);
    const token = getAccessToken();
    if (!token) return;

    const form = new FormData(e.currentTarget);
    try {
      await adminApi.createChallenge(token, {
        title: String(form.get("title")),
        description: String(form.get("description")),
        category: String(form.get("category")),
        difficulty: String(form.get("difficulty")),
        points: Number(form.get("points")),
        flag: String(form.get("flag")),
        dockerImage: String(form.get("dockerImage") || "") || undefined,
        isPublished: form.get("isPublished") === "on",
      });
      setMessage("문제가 생성되었습니다");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "생성 실패");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(item: ChallengeRow) {
    const token = getAccessToken();
    if (!token) return;
    await adminApi.updateChallenge(token, item.id, {
      isPublished: !item.isPublished,
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("이 문제를 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteChallenge(token, id);
    await load();
  }

  return (
    <div>
      <AdminCard title="새 문제 만들기" description="워게임 문제를 등록합니다">
        <form onSubmit={handleCreate}>
          <AdminInput name="title" label="제목" placeholder="문제 제목" required />
          <AdminTextarea
            name="description"
            label="설명"
            placeholder="문제 설명 (Markdown)"
            className="admin-textarea-mono"
            required
          />
          <div className="admin-form-grid admin-form-grid-3">
            <AdminSelect name="category" label="카테고리" required>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect name="difficulty" label="난이도" defaultValue="EASY">
              {["EASY", "MEDIUM", "HARD", "INSANE"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              name="points"
              type="number"
              label="기본 점수"
              defaultValue={100}
              min={0}
              required
              hint="난이도 가중치 적용 후 XP 지급 (Easy ×1 · Medium ×1.5 · Hard ×2 · Insane ×3)"
            />
          </div>
          <AdminInput name="flag" label="FLAG" placeholder="DYHS{...}" required />
          <AdminInput
            name="dockerImage"
            label="Docker 이미지"
            placeholder="선택 사항"
            hint="컨테이너 기반 문제인 경우에만 입력합니다"
          />
          <AdminCheckbox name="isPublished" label="생성 즉시 공개" />
          <div className="admin-form-actions">
            <AdminButton variant="primary" type="submit" disabled={loading}>
              {loading ? "생성 중…" : "문제 생성"}
            </AdminButton>
          </div>
          <AdminAlert message={message} variant={error ? "error" : "success"} />
        </form>
      </AdminCard>

      <AdminCard title="문제 목록" description={`총 ${items.length}개`}>
        {listLoading ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            불러오는 중
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <AdminRow
              key={item.id}
              title={item.title}
              meta={`${item.category} · ${item.difficulty} · ${calcChallengeXp(item.points, item.difficulty).toLocaleString()} XP (기본 ${item.points}) · ${item._count.solves} solved`}
              badge={
                <AdminBadge variant={item.isPublished ? "success" : "warning"}>
                  {item.isPublished ? "공개" : "비공개"}
                </AdminBadge>
              }
              actions={
                <>
                  <AdminButton variant="ghost" onClick={() => togglePublish(item)}>
                    {item.isPublished ? "비공개 전환" : "공개 전환"}
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => remove(item.id)}>
                    삭제
                  </AdminButton>
                </>
              }
            />
          ))
        ) : (
          <AdminEmpty message="등록된 문제가 없습니다" />
        )}
      </AdminCard>
    </div>
  );
}
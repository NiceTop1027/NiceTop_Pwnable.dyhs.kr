"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { calcChallengeXp } from "@/lib/challenge-xp";
import { useAuth  } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

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

export function ChallengeAdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<ChallengeRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = (await adminApi.challenges()) as ChallengeRow[];
    setItems(data);
    setError(null);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    setListLoading(true);
    load()
      .catch(() => {
        setItems([]);
        setError("문제 목록을 불러오지 못했습니다. 다시 로그인해 주세요.");
      })
      .finally(() => setListLoading(false));
  }, [authLoading, user]);

  async function togglePublish(item: ChallengeRow) {
    await adminApi.updateChallenge( item.id, {
      isPublished: !item.isPublished,
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("이 문제를 삭제할까요?")) return;
    await adminApi.deleteChallenge( id);
    await load();
  }

  return (
    <AdminCard title="워게임 문제" description="Notion 스타일 에디터로 문제 설명을 작성합니다">
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/challenges/new" className="admin-btn admin-btn-primary">
          새 문제
        </Link>
      </div>

      {error ? (
        <AdminEmpty message={error} />
      ) : listLoading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : items.length > 0 ? (
        items.map((item) => (
          <AdminRow
            key={item.id}
            title={item.title}
            meta={`${item.category} · ${item.difficulty} · ${calcChallengeXp(item.points, item.difficulty).toLocaleString()} XP · ${item._count.solves} solved`}
            badge={
              <AdminBadge variant={item.isPublished ? "success" : "warning"}>
                {item.isPublished ? "공개" : "비공개"}
              </AdminBadge>
            }
            actions={
              <>
                <Link
                  href={`/admin/challenges/${item.id}`}
                  className="admin-btn admin-btn-ghost"
                >
                  편집
                </Link>
                <AdminButton variant="ghost" onClick={() => togglePublish(item)}>
                  {item.isPublished ? "비공개" : "공개"}
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
  );
}
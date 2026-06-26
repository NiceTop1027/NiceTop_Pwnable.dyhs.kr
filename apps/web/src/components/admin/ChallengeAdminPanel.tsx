"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { calcChallengeXp } from "@/lib/challenge-xp";
import { useAuth } from "@/providers/AuthProvider";
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
  dockerImage: string | null;
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
    await adminApi.updateChallenge(item.id, {
      isPublished: !item.isPublished,
    });
    await load();
  }

  async function remove(item: ChallengeRow) {
    if (item.isPublished) {
      alert("공개된 문제는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("이 문제를 삭제할까요?")) return;
    await adminApi.deleteChallenge(item.id);
    await load();
  }

  return (
    <AdminCard
      title="워게임 문제"
      description="문제 생성 후 편집기에서 설명 작성 · ZIP 배포를 진행합니다"
    >
      <div className="admin-form-actions challenge-admin-toolbar">
        <Link href="/admin/challenges/guide" className="admin-btn admin-btn-primary">
          새 문제
        </Link>
        <Link href="/admin/challenges/guide" className="admin-btn admin-btn-ghost">
          출제 안내
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
        <div className="admin-list">
        {items.map((item, index) => (
          <AdminRow
            key={item.id}
            index={index}
            title={item.title}
            meta={`${item.slug} · ${item.category} · ${item.difficulty} · ${calcChallengeXp(item.points, item.difficulty).toLocaleString()} XP · ${item._count.solves} solved`}
            badge={
              <>
                <AdminBadge variant={item.dockerImage ? "success" : "default"}>
                  {item.dockerImage ? "인스턴스" : "로컬"}
                </AdminBadge>
                <AdminBadge variant={item.isPublished ? "success" : "warning"}>
                  {item.isPublished ? "공개" : "비공개"}
                </AdminBadge>
              </>
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
                {!item.isPublished && (
                  <AdminButton variant="danger" onClick={() => remove(item)}>
                    삭제
                  </AdminButton>
                )}
              </>
            }
          />
        ))}
        </div>
      ) : (
        <AdminEmpty message="등록된 문제가 없습니다" />
      )}
    </AdminCard>
  );
}
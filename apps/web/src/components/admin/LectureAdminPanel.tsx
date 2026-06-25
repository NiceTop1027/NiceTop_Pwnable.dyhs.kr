"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { useAuth  } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

type LectureRow = {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  versions: { isPublished: boolean }[];
  updatedAt?: string;
};

export function LectureAdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const list = await adminApi.lectures();
    setLectures(list as LectureRow[]);
    setError(null);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    load()
      .catch(() => {
        setLectures([]);
        setError("문서 목록을 불러오지 못했습니다. 다시 로그인해 주세요.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  async function remove(id: string) {
    if (!confirm("이 문서를 삭제할까요?")) return;
    await adminApi.deleteLecture( id);
    await load();
  }

  return (
    <AdminCard
      title="학습 문서"
      description="트랙 단계에 연결할 Markdown 강의 문서를 작성합니다"
    >
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/curriculum/new" className="admin-btn admin-btn-primary">
          새 문서
        </Link>
      </div>

      {error ? (
        <AdminEmpty message={error} />
      ) : loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : lectures.length > 0 ? (
        lectures.map((l) => {
          const published = l.versions[0]?.isPublished ?? false;
          return (
            <AdminRow
              key={l.id}
              title={l.title}
              meta={
                l.updatedAt
                  ? `${l.category.name} · ${new Date(l.updatedAt).toLocaleString("ko-KR")}`
                  : l.category.name
              }
              badge={
                <AdminBadge variant={published ? "success" : "default"}>
                  {published ? "공개" : "비공개"}
                </AdminBadge>
              }
              actions={
                <>
                  <Link
                    href={`/admin/curriculum/${l.id}`}
                    className="admin-btn admin-btn-ghost"
                  >
                    편집
                  </Link>
                  <AdminButton variant="danger" onClick={() => remove(l.id)}>
                    삭제
                  </AdminButton>
                </>
              }
            />
          );
        })
      ) : (
        <AdminEmpty message="등록된 문서가 없습니다" />
      )}
    </AdminCard>
  );
}
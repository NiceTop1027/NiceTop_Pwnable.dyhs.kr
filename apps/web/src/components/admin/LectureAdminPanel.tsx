"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
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
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    const list = await adminApi.lectures(token);
    setLectures(list as LectureRow[]);
  }

  useEffect(() => {
    load()
      .catch(() => setLectures([]))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    if (!confirm("이 강의를 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteLecture(token, id);
    await load();
  }

  return (
    <AdminCard
      title="강의 문서"
      description="Notion 스타일 에디터로 Markdown 강의를 작성합니다"
    >
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/lectures/new" className="admin-btn admin-btn-primary">
          새 강의
        </Link>
      </div>

      {loading ? (
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
                    href={`/admin/lectures/${l.id}`}
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
        <AdminEmpty message="등록된 강의가 없습니다" />
      )}
    </AdminCard>
  );
}
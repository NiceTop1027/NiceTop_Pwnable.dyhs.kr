"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

type CurriculumRow = {
  id: string;
  title: string;
  tier: string;
  updatedAt?: string;
  items: unknown[];
};

const tierVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  BEGINNER: "success",
  INTERMEDIATE: "default",
  ADVANCED: "warning",
  EXPERT: "danger",
};

export function CurriculumAdminPanel() {
  const [items, setItems] = useState<CurriculumRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .curricula(token)
      .then((data) => setItems(data as CurriculumRow[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminCard
      title="커리큘럼 문서"
      description="Notion 스타일 에디터로 학습 경로를 작성합니다"
    >
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/curriculum/new" className="admin-btn admin-btn-primary">
          새 커리큘럼
        </Link>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : items.length > 0 ? (
        items.map((c) => (
          <AdminRow
            key={c.id}
            title={c.title}
            meta={
              c.updatedAt
                ? `${c.items?.length ?? 0}개 항목 · ${new Date(c.updatedAt).toLocaleString("ko-KR")}`
                : `${c.items?.length ?? 0}개 항목`
            }
            badge={
              <AdminBadge variant={tierVariant[c.tier] ?? "default"}>
                {c.tier}
              </AdminBadge>
            }
            actions={
              <Link
                href={`/admin/curriculum/${c.id}`}
                className="admin-btn admin-btn-ghost"
              >
                편집
              </Link>
            }
          />
        ))
      ) : (
        <AdminEmpty message="등록된 커리큘럼이 없습니다" />
      )}
    </AdminCard>
  );
}
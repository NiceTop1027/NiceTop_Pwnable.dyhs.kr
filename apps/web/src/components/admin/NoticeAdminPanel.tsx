"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type Notice } from "@/lib/api";
import { useAuth  } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

export function NoticeAdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setItems(await adminApi.notices());
    setError(null);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    load()
      .catch(() => {
        setItems([]);
        setError("공지 목록을 불러오지 못했습니다. 다시 로그인해 주세요.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    await adminApi.deleteNotice( id);
    await load();
  }

  return (
    <AdminCard title="공지" description="Notion 스타일 에디터로 공지를 작성합니다">
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/notices/new" className="admin-btn admin-btn-primary">
          새 공지
        </Link>
      </div>

      {error ? (
        <AdminEmpty message={error} />
      ) : loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : items.length > 0 ? (
        items.map((n) => (
          <AdminRow
            key={n.id}
            title={n.title}
            meta={new Date(n.publishedAt).toLocaleString("ko-KR")}
            badge={
              n.isPinned ? <AdminBadge variant="warning">고정</AdminBadge> : undefined
            }
            actions={
              <>
                <Link href={`/admin/notices/${n.id}`} className="admin-btn admin-btn-ghost">
                  편집
                </Link>
                <AdminButton variant="danger" onClick={() => remove(n.id)}>
                  삭제
                </AdminButton>
              </>
            }
          />
        ))
      ) : (
        <AdminEmpty message="등록된 공지가 없습니다" />
      )}
    </AdminCard>
  );
}
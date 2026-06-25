"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminEmpty } from "@/components/admin/ui/AdminEmpty";

type AdminStats = {
  users: number;
  lectures: number;
  challenges: number;
  solves: number;
  notices: number;
  posts: number;
};

function normalizeStats(raw: Record<string, number> | null): AdminStats | null {
  if (!raw) return null;
  return {
    users: raw.users ?? 0,
    lectures: raw.lectures ?? 0,
    challenges: raw.challenges ?? 0,
    solves: raw.solves ?? 0,
    notices: raw.notices ?? 0,
    posts: raw.posts ?? 0,
  };
}

function formatStat(value: number) {
  return value.toLocaleString("ko-KR");
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((data) => setStats(normalizeStats(data)))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const items = stats
    ? [
        { label: "회원", value: stats.users },
        { label: "커리큘럼", value: stats.lectures },
        { label: "공개 문제", value: stats.challenges },
        { label: "풀이", value: stats.solves },
        { label: "공지", value: stats.notices },
        { label: "커뮤니티 글", value: stats.posts },
      ]
    : [];

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-spinner" />
        통계 불러오는 중
      </div>
    );
  }

  return (
    <AdminCard title="플랫폼 현황" description="실시간 집계 데이터입니다">
      {items.length > 0 ? (
        <div className="admin-stat-grid">
          {items.map((item) => (
            <div key={item.label} className="admin-stat-card">
              <p className="admin-stat-label">{item.label}</p>
              <p className="admin-stat-value">{formatStat(item.value)}</p>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmpty message="통계를 불러올 수 없습니다" />
      )}
    </AdminCard>
  );
}
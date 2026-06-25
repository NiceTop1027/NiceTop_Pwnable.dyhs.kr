"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminEmpty } from "@/components/admin/ui/AdminEmpty";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .stats(token)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const items = stats
    ? [
        { label: "회원", value: stats.users },
        { label: "강의", value: stats.lectures },
        { label: "공개 문제", value: stats.challenges },
        { label: "풀이", value: stats.solves },
        { label: "공지", value: stats.notices },
        { label: "커리큘럼", value: stats.curricula },
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
              <p className="admin-stat-value">{item.value.toLocaleString("ko-KR")}</p>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmpty message="통계를 불러올 수 없습니다" />
      )}
    </AdminCard>
  );
}
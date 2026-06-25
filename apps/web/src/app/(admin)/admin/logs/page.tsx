"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminEmpty } from "@/components/admin/ui/AdminEmpty";
import { AdminRow } from "@/components/admin/ui/AdminRow";

type LogRow = {
  id: string;
  action: string;
  targetType: string | null;
  createdAt: string;
  admin: { username: string };
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .logs()
      .then((data) => setLogs(data as LogRow[]))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-spinner" />
        로그 불러오는 중
      </div>
    );
  }

  return (
    <AdminCard title="작업 기록" description={`총 ${logs.length}건`}>
      {logs.length > 0 ? (
        logs.map((log) => (
          <AdminRow
            key={log.id}
            title={log.action}
            meta={`${log.admin.username} · ${log.targetType ?? "—"} · ${new Date(log.createdAt).toLocaleString("ko-KR")}`}
          />
        ))
      ) : (
        <AdminEmpty message="기록된 로그가 없습니다" />
      )}
    </AdminCard>
  );
}
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { INQUIRY_CATEGORIES } from "@/lib/legal";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminEmpty } from "@/components/admin/ui/AdminEmpty";

type InquiryRow = {
  id: string;
  category: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  user: { username: string; displayName: string | null } | null;
};

const STATUS_LABELS: Record<InquiryRow["status"], string> = {
  PENDING: "대기",
  IN_PROGRESS: "처리 중",
  RESOLVED: "완료",
  CLOSED: "종료",
};

const categoryLabel = Object.fromEntries(
  INQUIRY_CATEGORIES.map((item) => [item.value, item.label]),
) as Record<string, string>;

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi
      .inquiries()
      .then((data) => setItems(data as InquiryRow[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: InquiryRow["status"]) {
    setUpdatingId(id);
    try {
      await adminApi.updateInquiryStatus(id, status);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-spinner" />
        문의 불러오는 중
      </div>
    );
  }

  return (
    <AdminCard title="문의" description={`총 ${items.length}건`}>
      {items.length > 0 ? (
        <div className="admin-inquiry-list">
          {items.map((item) => (
            <article key={item.id} className="admin-inquiry-item">
              <div className="admin-inquiry-head">
                <div>
                  <p className="admin-inquiry-subject">{item.subject}</p>
                  <p className="admin-inquiry-meta">
                    {categoryLabel[item.category] ?? item.category} · {item.name} ·{" "}
                    {item.email}
                    {item.user
                      ? ` · @${item.user.username}`
                      : ""} ·{" "}
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                <select
                  className="admin-inquiry-status"
                  value={item.status}
                  disabled={updatingId === item.id}
                  onChange={(e) =>
                    updateStatus(item.id, e.target.value as InquiryRow["status"])
                  }
                  aria-label="문의 상태"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="admin-inquiry-message">{item.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmpty message="접수된 문의가 없습니다" />
      )}
    </AdminCard>
  );
}
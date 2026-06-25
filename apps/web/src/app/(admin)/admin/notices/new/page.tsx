"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";

export default function AdminNoticeNewPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    adminApi
      .createNotice(token, {
        title: "제목 없음",
        content: "",
        isPinned: false,
      })
      .then((notice) => {
        if (notice && typeof notice === "object" && "id" in notice) {
          router.replace(`/admin/notices/${(notice as { id: string }).id}`);
        }
      })
      .catch(() => router.replace("/admin/notices"));
  }, [router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 공지 준비 중
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { createOnce } from "@/lib/create-once";
import { useAuth  } from "@/providers/AuthProvider";

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    createOnce("admin:notice:new", () =>
      adminApi.createNotice( {
        title: "제목 없음",
        content: "",
        isPinned: false,
      }),
    )
      .then((notice) => {
        router.replace(`/admin/notices/${notice.id}`);
      })
      .catch(() => router.replace("/admin/notices"));
  }, [isLoading, user, router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 공지 준비 중
      </div>
    </div>
  );
}
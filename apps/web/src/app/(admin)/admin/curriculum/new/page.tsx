"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";

export default function AdminCurriculumNewPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    adminApi
      .createCurriculum(token, { title: "제목 없음", tier: "BEGINNER" })
      .then((c) => router.replace(`/admin/curriculum/${c.id}`))
      .catch(() => router.replace("/admin/curriculum"));
  }, [router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 문서 준비 중
      </div>
    </div>
  );
}
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
      .lectureCategories(token)
      .then((categories) => {
        const categoryId = categories[0]?.id;
        if (!categoryId) {
          router.replace("/admin/curriculum");
          return;
        }
        return adminApi.createLecture(token, {
          categoryId,
          title: "제목 없음",
          content: "",
          isPublished: false,
        });
      })
      .then((lecture) => {
        if (lecture && typeof lecture === "object" && "id" in lecture) {
          router.replace(`/admin/curriculum/${(lecture as { id: string }).id}`);
        }
      })
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
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { createOnce } from "@/lib/create-once";
import { useAuth  } from "@/providers/AuthProvider";

export default function AdminCurriculumNewPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    createOnce("admin:curriculum:new", async () => {
      const categories = await adminApi.lectureCategories();
      const categoryId = categories[0]?.id;
      if (!categoryId) {
        throw new Error("No lecture categories");
      }

      return adminApi.createLecture( {
        categoryId,
        title: "제목 없음",
        content: "",
        isPublished: false,
      });
    })
      .then((lecture) => {
        router.replace(`/admin/curriculum/${lecture.id}`);
      })
      .catch(() => router.replace("/admin/curriculum"));
  }, [isLoading, user, router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 문서 준비 중
      </div>
    </div>
  );
}
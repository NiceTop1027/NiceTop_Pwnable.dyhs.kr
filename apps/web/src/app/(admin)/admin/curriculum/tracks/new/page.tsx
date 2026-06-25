"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { createOnce } from "@/lib/create-once";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";

export default function AdminCurriculumTrackNewPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    const token = getAccessToken();
    if (!token) {
      router.replace("/admin/curriculum");
      return;
    }

    createOnce("admin:curriculum-track:new", () =>
      adminApi.createCurriculum(token, {
        title: "입문",
        description: "",
        tier: "BEGINNER",
      }),
    )
      .then((track) => {
        router.replace(`/admin/curriculum/tracks/${track.id}`);
      })
      .catch(() => router.replace("/admin/curriculum"));
  }, [isLoading, user, router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 트랙 준비 중
      </div>
    </div>
  );
}
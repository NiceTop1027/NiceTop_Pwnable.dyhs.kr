"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { createOnce } from "@/lib/create-once";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";

export default function AdminChallengeNewPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    const token = getAccessToken();
    if (!token) {
      router.replace("/admin/challenges");
      return;
    }

    createOnce("admin:challenge:new", () =>
      adminApi.createChallenge(token, {
        title: "제목 없음",
        description: "",
        category: "PWN",
        difficulty: "EASY",
        points: 100,
        flag: "DYHS{change_me}",
        isPublished: false,
      }),
    )
      .then((challenge) => {
        router.replace(`/admin/challenges/${challenge.id}`);
      })
      .catch(() => router.replace("/admin/challenges"));
  }, [isLoading, user, router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 문제 준비 중
      </div>
    </div>
  );
}
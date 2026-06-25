"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";

export default function AdminChallengeNewPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    adminApi
      .createChallenge(token, {
        title: "제목 없음",
        description: "",
        category: "PWN",
        difficulty: "EASY",
        points: 100,
        flag: "DYHS{change_me}",
        isPublished: false,
      })
      .then((challenge) => {
        if (challenge && typeof challenge === "object" && "id" in challenge) {
          router.replace(`/admin/challenges/${(challenge as { id: string }).id}`);
        }
      })
      .catch(() => router.replace("/admin/challenges"));
  }, [router]);

  return (
    <div className="notion-page">
      <div className="admin-loading">
        <span className="admin-spinner" />
        새 문제 준비 중
      </div>
    </div>
  );
}
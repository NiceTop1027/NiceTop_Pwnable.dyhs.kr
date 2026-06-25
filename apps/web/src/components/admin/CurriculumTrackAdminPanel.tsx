"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type AdminCurriculum } from "@/lib/api";
import { CURRICULUM_TIER_LABELS } from "@/lib/curriculum";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

export function CurriculumTrackAdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [tracks, setTracks] = useState<AdminCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    const list = await adminApi.curricula(token);
    setTracks(list);
    setError(null);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    load()
      .catch(() => {
        setTracks([]);
        setError("트랙 목록을 불러오지 못했습니다. 다시 로그인해 주세요.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  async function remove(id: string) {
    if (!confirm("이 트랙을 삭제할까요? 연결된 단계 정보도 함께 삭제됩니다.")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteCurriculum(token, id);
    await load();
  }

  return (
    <AdminCard
      title="커리큘럼 트랙"
      description="공개 커리큘럼 페이지의 01 BEGINNER · 입문 트랙 섹션을 관리합니다"
    >
      <div className="admin-form-actions" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/admin/curriculum/tracks/new" className="admin-btn admin-btn-primary">
          새 트랙
        </Link>
      </div>

      {error ? (
        <AdminEmpty message={error} />
      ) : loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : tracks.length > 0 ? (
        tracks.map((track, index) => (
          <AdminRow
            key={track.id}
            title={`${String(index + 1).padStart(2, "0")} ${track.tier} · ${track.title} 트랙`}
            meta={`${track.items.length}개 단계 · slug: ${track.slug}`}
            badge={
              <AdminBadge variant="default">
                {CURRICULUM_TIER_LABELS[track.tier] ?? track.tier}
              </AdminBadge>
            }
            actions={
              <>
                <Link
                  href={`/admin/curriculum/tracks/${track.id}`}
                  className="admin-btn admin-btn-ghost"
                >
                  편집
                </Link>
                <AdminButton variant="danger" onClick={() => remove(track.id)}>
                  삭제
                </AdminButton>
              </>
            }
          />
        ))
      ) : (
        <AdminEmpty message="등록된 트랙이 없습니다" />
      )}
    </AdminCard>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, type LearningProgressItem } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

function resumeHref(item: LearningProgressItem) {
  if (!item.lastPageSlug) return `/curriculum/${item.slug}`;
  const first = item.visitedPageSlugs[0];
  if (item.lastPageSlug === first) return `/curriculum/${item.slug}`;
  return `/curriculum/${item.slug}/${item.lastPageSlug}`;
}

export function LearningProgressList() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<LearningProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const rows = await api.learningProgress();
      setItems(rows);
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    load();
  }, [authLoading, user, load]);

  if (authLoading || loading) {
    return <p className="learning-progress-empty">학습 기록 불러오는 중</p>;
  }

  if (!user) {
    return (
      <p className="learning-progress-empty">
        로그인하면 학습 기록을 확인할 수 있습니다.
      </p>
    );
  }

  if (error) {
    return (
      <p className="learning-progress-empty">
        학습 기록을 불러오지 못했습니다.{" "}
        <button type="button" className="learning-progress-link" onClick={load}>
          다시 시도
        </button>
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="learning-progress-empty">
        아직 학습 기록이 없습니다.{" "}
        <Link href="/curriculum" className="learning-progress-link">
          커리큘럼
        </Link>
        에서 시작해 보세요.
      </p>
    );
  }

  return (
    <ul className="learning-progress-list">
      {items.map((item) => (
        <li key={item.lectureId} className="learning-progress-item">
          <div className="learning-progress-item-head">
            <div>
              <p className="learning-progress-item-category">{item.category}</p>
              <Link href={resumeHref(item)} className="learning-progress-item-title">
                {item.title}
              </Link>
            </div>
            <span className="learning-progress-item-pct">
              {item.completed ? "완료" : `${item.progress}%`}
            </span>
          </div>
          <div className="learning-progress-item-track" aria-hidden>
            <span
              className="learning-progress-item-fill"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="learning-progress-item-meta">
            {item.visitedPageSlugs.length}/{item.totalPages}페이지 학습
            {!item.completed && item.lastPageSlug && (
              <>
                {" "}
                ·{" "}
                <Link href={resumeHref(item)} className="learning-progress-link">
                  이어서 학습
                </Link>
              </>
            )}
            {item.completed && (
              <>
                {" "}
                ·{" "}
                <Link href={resumeHref(item)} className="learning-progress-link">
                  다시 보기
                </Link>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
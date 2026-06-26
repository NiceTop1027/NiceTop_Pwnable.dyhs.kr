"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { adminApi } from "@/lib/api";
import {
  isValidRepositorySlug,
  suggestRepositorySlug,
} from "@/lib/challenge-slug";
import { AdminAlert } from "./ui/AdminAlert";
import { AdminCard } from "./ui/AdminCard";
import { AdminInput } from "./ui/AdminField";

export function ChallengeCreateForm() {
  const router = useRouter();
  const [problemName, setProblemName] = useState("");
  const [repositorySlug, setRepositorySlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slugTouched) return;
    setRepositorySlug(suggestRepositorySlug(problemName));
  }, [problemName, slugTouched]);

  const slugValid = isValidRepositorySlug(repositorySlug);
  const canSubmit = agreed && slugValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const challenge = await adminApi.createChallenge({
        title: "제목 없음",
        slug: repositorySlug,
        description: "",
        category: "PWN",
        difficulty: "EASY",
        points: 100,
        flag: "DYHS{change_me}",
        isPublished: false,
      });
      router.replace(`/admin/challenges/${challenge.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문제를 생성하지 못했습니다.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="challenge-create">
      <Link href="/admin/challenges/guide" className="challenge-guide__back">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        출제 안내
      </Link>

      <header className="challenge-guide__header">
        <h1 className="challenge-guide__title">새 문제</h1>
        <p className="challenge-guide__lead">
          Repository 이름만 정하면 됩니다. 제목과 FLAG는 편집기에서 바꿉니다.
        </p>
      </header>

      <AdminCard>
        <form onSubmit={handleSubmit} className="challenge-create__form">
          <AdminInput
            label="문제 이름"
            hint="slug 추천용. 화면에 보이는 제목은 아닙니다."
            value={problemName}
            onChange={(e) => setProblemName(e.target.value)}
            placeholder="Simple Buffer Overflow"
            autoComplete="off"
          />

          <AdminInput
            label="Repository"
            hint="a-z, 0-9, -, _"
            value={repositorySlug}
            onChange={(e) => {
              setSlugTouched(true);
              setRepositorySlug(e.target.value.toLowerCase());
            }}
            placeholder="simple-buffer-overflow"
            autoComplete="off"
            spellCheck={false}
            className={
              repositorySlug && !slugValid ? "challenge-create__input-invalid" : ""
            }
          />

          {repositorySlug && !slugValid && (
            <p className="challenge-create__field-error">
              형식이 맞지 않습니다.
            </p>
          )}

          <label className="admin-checkbox challenge-create__terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="admin-checkbox-input"
            />
            <span className="admin-checkbox-box" />
            <span className="admin-checkbox-label">
              이용약관 및 개인정보처리방침에 동의합니다.
            </span>
          </label>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={!canSubmit}
            >
              {submitting ? "생성 중…" : "생성"}
            </button>
            <Link href="/admin/challenges" className="admin-btn admin-btn-ghost">
              취소
            </Link>
          </div>

          {error && <AdminAlert message={error} variant="error" />}
        </form>
      </AdminCard>
    </div>
  );
}
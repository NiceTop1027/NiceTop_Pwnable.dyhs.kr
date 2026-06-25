"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminAlert } from "./ui/AdminAlert";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminCheckbox } from "./ui/AdminField";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminInput, AdminSelect, AdminTextarea } from "./ui/AdminField";
import { AdminRow } from "./ui/AdminRow";

type Category = { id: string; name: string; slug: string };
type LectureRow = {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  versions: { isPublished: boolean }[];
};

export function LectureAdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    const [cats, list] = await Promise.all([
      adminApi.lectureCategories(token),
      adminApi.lectures(token),
    ]);
    setCategories(cats);
    setLectures(list as LectureRow[]);
  }

  useEffect(() => {
    load()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError(false);
    const token = getAccessToken();
    if (!token) return;
    const form = new FormData(e.currentTarget);

    try {
      await adminApi.createLecture(token, {
        categoryId: String(form.get("categoryId")),
        title: String(form.get("title")),
        description: String(form.get("description") || "") || undefined,
        content: String(form.get("content")),
        isPublished: form.get("isPublished") === "on",
      });
      setMessage("강의가 생성되었습니다");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "생성 실패");
      setError(true);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 강의를 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteLecture(token, id);
    await load();
  }

  return (
    <div>
      <AdminCard title="새 강의 만들기" description="Markdown 강의를 작성합니다">
        <form onSubmit={handleCreate}>
          <AdminSelect name="categoryId" label="카테고리" required defaultValue="">
            <option value="" disabled>
              카테고리 선택
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
          <AdminInput name="title" label="제목" placeholder="강의 제목" required />
          <AdminInput name="description" label="설명" placeholder="한 줄 소개" />
          <AdminTextarea
            name="content"
            label="내용"
            placeholder="Markdown 본문"
            className="admin-textarea-mono min-h-40"
            required
          />
          <AdminCheckbox name="isPublished" label="생성 즉시 공개" defaultChecked />
          <div className="admin-form-actions">
            <AdminButton variant="primary" type="submit">
              강의 생성
            </AdminButton>
          </div>
          <AdminAlert message={message} variant={error ? "error" : "success"} />
        </form>
      </AdminCard>

      <AdminCard title="강의 목록" description={`총 ${lectures.length}개`}>
        {loading ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            불러오는 중
          </div>
        ) : lectures.length > 0 ? (
          lectures.map((l) => (
            <AdminRow
              key={l.id}
              title={l.title}
              meta={l.category.name}
              actions={
                <AdminButton variant="danger" onClick={() => remove(l.id)}>
                  삭제
                </AdminButton>
              }
            />
          ))
        ) : (
          <AdminEmpty message="등록된 강의가 없습니다" />
        )}
      </AdminCard>
    </div>
  );
}
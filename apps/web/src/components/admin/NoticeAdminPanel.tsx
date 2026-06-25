"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminApi, type Notice } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminAlert } from "./ui/AdminAlert";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminCheckbox } from "./ui/AdminField";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminInput, AdminTextarea } from "./ui/AdminField";
import { AdminRow } from "./ui/AdminRow";

export function NoticeAdminPanel() {
  const [items, setItems] = useState<Notice[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    setItems(await adminApi.notices(token));
  }

  useEffect(() => {
    load()
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    await adminApi.createNotice(token, {
      title: String(form.get("title")),
      content: String(form.get("content")),
      isPinned: form.get("isPinned") === "on",
    });
    setMessage("공지가 등록되었습니다");
    e.currentTarget.reset();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    await adminApi.deleteNotice(token, id);
    await load();
  }

  return (
    <div>
      <AdminCard title="새 공지 등록" description="사용자에게 전달할 공지를 작성합니다">
        <form onSubmit={handleCreate}>
          <AdminInput name="title" label="제목" placeholder="공지 제목" required />
          <AdminTextarea
            name="content"
            label="내용"
            placeholder="공지 내용"
            className="min-h-32"
            required
          />
          <AdminCheckbox name="isPinned" label="상단 고정" />
          <div className="admin-form-actions">
            <AdminButton variant="primary" type="submit">
              공지 등록
            </AdminButton>
          </div>
          <AdminAlert message={message} variant="success" />
        </form>
      </AdminCard>

      <AdminCard title="공지 목록" description={`총 ${items.length}개`}>
        {loading ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            불러오는 중
          </div>
        ) : items.length > 0 ? (
          items.map((n) => (
            <AdminRow
              key={n.id}
              title={n.title}
              badge={
                n.isPinned ? <AdminBadge variant="warning">고정</AdminBadge> : undefined
              }
              actions={
                <AdminButton variant="danger" onClick={() => remove(n.id)}>
                  삭제
                </AdminButton>
              }
            />
          ))
        ) : (
          <AdminEmpty message="등록된 공지가 없습니다" />
        )}
      </AdminCard>
    </div>
  );
}
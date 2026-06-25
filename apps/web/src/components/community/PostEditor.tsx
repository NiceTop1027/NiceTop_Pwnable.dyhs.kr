"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";

type PostEditorProps = {
  boardSlug: string;
  boardName: string;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
};

export function PostEditor({
  boardSlug,
  boardName,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
}: PostEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="board-auth-gate">
        <p>글을 작성하려면 로그인이 필요합니다.</p>
        <Button href={`/auth?next=/community/${boardSlug}/new`} variant="fill">
          로그인
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        const post = await api.createBoardPost(boardSlug, token, {
          title: trimmedTitle,
          content: trimmedContent,
        });
        router.push(`/community/${boardSlug}/${post.id}`);
      } else if (postId) {
        await api.updateBoardPost(boardSlug, postId, token, {
          title: trimmedTitle,
          content: trimmedContent,
        });
        router.push(`/community/${boardSlug}/${postId}`);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "저장에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="board-editor" onSubmit={handleSubmit}>
      <p className="board-editor-eyebrow">{boardName}</p>

      {error && <p className="board-editor-error">{error}</p>}

      <label className="board-field">
        <span className="board-field-label">제목</span>
        <input
          className="board-field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={200}
        />
      </label>

      <label className="board-field">
        <span className="board-field-label">내용</span>
        <textarea
          className="board-field-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="마크다운을 지원합니다. 코드 블록, 목록, 링크 등을 사용할 수 있습니다."
          rows={16}
        />
      </label>

      <div className="board-editor-actions">
        <Button
          type="button"
          variant="outline"
          href={
            mode === "edit" && postId
              ? `/community/${boardSlug}/${postId}`
              : `/community/${boardSlug}`
          }
        >
          취소
        </Button>
        <Button type="submit" variant="fill" disabled={loading}>
          {loading ? "저장 중…" : mode === "create" ? "등록" : "수정"}
        </Button>
      </div>
    </form>
  );
}
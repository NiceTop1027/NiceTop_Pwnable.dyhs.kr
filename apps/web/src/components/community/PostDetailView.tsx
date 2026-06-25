"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { DocumentContent } from "@/components/content/DocumentContent";
import { Button } from "@/components/ui/Button";
import {
  api,
  ApiError,
  type BoardComment,
  type BoardPostDetail,
} from "@/lib/api";
import { formatBoardDate } from "@/lib/community";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";
import { UserProfileLink } from "@/components/user/UserProfileLink";

function canModerate(role?: string) {
  return role === "OWNER" || role === "ADMIN" || role === "MODERATOR";
}

function countComments(comments: BoardComment[]) {
  return comments.reduce(
    (sum, comment) => sum + 1 + (comment.replies?.length ?? 0),
    0,
  );
}

function CommentItem({
  comment,
  boardSlug,
  postId,
  currentUserId,
  userRole,
  onChanged,
  depth = 0,
}: {
  comment: BoardComment;
  boardSlug: string;
  postId: string;
  currentUserId?: string;
  userRole?: string;
  onChanged: () => void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const canEdit =
    currentUserId === comment.author.id || canModerate(userRole);

  async function saveEdit() {
    const token = getAccessToken();
    if (!token || !text.trim()) return;
    setLoading(true);
    try {
      await api.updateBoardComment(boardSlug, postId, comment.id, token, {
        content: text.trim(),
      });
      setEditing(false);
      onChanged();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("댓글을 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      await api.deleteBoardComment(boardSlug, postId, comment.id, token);
      onChanged();
    } finally {
      setLoading(false);
    }
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !text.trim()) return;
    setLoading(true);
    try {
      await api.createBoardComment(boardSlug, postId, token, {
        content: text.trim(),
        parentId: comment.id,
      });
      setText("");
      setReplyOpen(false);
      onChanged();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`board-comment${depth > 0 ? " board-comment--reply" : ""}`}>
      <div className="board-comment-layout">
        <UserProfileLink
          user={comment.author}
          size="xs"
          className="board-comment-profile"
        />
        <div className="board-comment-main">
          <div className="board-comment-head">
            <span className="board-comment-date">
              {formatBoardDate(comment.createdAt)}
            </span>
          </div>

      {editing ? (
        <div className="board-comment-edit">
          <textarea
            className="board-field-textarea board-field-textarea--compact"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <div className="board-comment-edit-actions">
            <button
              type="button"
              className="board-text-btn"
              onClick={() => {
                setEditing(false);
                setText(comment.content);
              }}
            >
              취소
            </button>
            <button
              type="button"
              className="board-text-btn board-text-btn--primary"
              onClick={saveEdit}
              disabled={loading}
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="board-comment-body">{comment.content}</p>
      )}

      <div className="board-comment-actions">
        {currentUserId && depth === 0 && (
          <button
            type="button"
            className="board-text-btn"
            onClick={() => {
              setReplyOpen((v) => !v);
              setText("");
            }}
          >
            답글
          </button>
        )}
        {canEdit && !editing && (
          <>
            <button
              type="button"
              className="board-text-btn"
              onClick={() => setEditing(true)}
            >
              수정
            </button>
            <button
              type="button"
              className="board-text-btn board-text-btn--danger"
              onClick={remove}
              disabled={loading}
            >
              삭제
            </button>
          </>
        )}
      </div>

      {replyOpen && (
        <form className="board-reply-form" onSubmit={submitReply}>
          <textarea
            className="board-field-textarea board-field-textarea--compact"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="답글을 입력하세요"
            rows={3}
          />
          <button
            type="submit"
            className="board-text-btn board-text-btn--primary"
            disabled={loading}
          >
            답글 등록
          </button>
        </form>
      )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          boardSlug={boardSlug}
          postId={postId}
          currentUserId={currentUserId}
          userRole={userRole}
          onChanged={onChanged}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function PostDetailView({
  initialPost,
}: {
  initialPost: BoardPostDetail;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    const token = getAccessToken();
    const next = await api.boardPost(post.board.slug, post.id, token);
    setPost(next);
  }, [post.board.slug, post.id]);

  const isAuthor = user?.id === post.author.id;
  const canEdit = isAuthor || canModerate(user?.role);
  const commentCount = countComments(post.comments);

  async function toggleLike() {
    const token = getAccessToken();
    if (!token) {
      router.push(`/auth?next=/community/${post.board.slug}/${post.id}`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.toggleBoardPostLike(
        post.board.slug,
        post.id,
        token,
      );
      setPost((prev) => ({
        ...prev,
        likedByMe: res.liked,
        _count: {
          ...prev._count,
          likes: prev._count.likes + (res.liked ? 1 : -1),
        },
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "요청 실패");
    } finally {
      setLoading(false);
    }
  }

  async function removePost() {
    if (!confirm("게시글을 삭제할까요?")) return;
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      await api.deleteBoardPost(post.board.slug, post.id, token);
      router.push(`/community/${post.board.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      router.push(`/auth?next=/community/${post.board.slug}/${post.id}`);
      return;
    }
    if (!comment.trim()) return;

    setLoading(true);
    setError("");
    try {
      await api.createBoardComment(post.board.slug, post.id, token, {
        content: comment.trim(),
      });
      setComment("");
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "댓글 등록 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="board-post">
      <header className="board-post-header">
        <Link
          href={`/community/${post.board.slug}`}
          className="board-post-board"
        >
          {post.board.name}
        </Link>
        <h1 className="board-post-title">
          {post.isPinned && (
            <span className="board-post-pin">고정</span>
          )}
          {post.title}
        </h1>
        <div className="board-post-meta">
          <UserProfileLink user={post.author} size="xs" />
          <span className="board-post-meta-sep">·</span>
          <span>{formatBoardDate(post.createdAt)}</span>
          <span className="board-post-meta-sep">·</span>
          <span>조회 {post.viewCount}</span>
        </div>
      </header>

      <div className="board-post-body">
        <DocumentContent content={post.content} />
      </div>

      <div className="board-post-toolbar">
        <button
          type="button"
          className={`board-post-action${post.likedByMe ? " board-post-action--active" : ""}`}
          onClick={toggleLike}
          disabled={loading}
        >
          <Heart className="h-4 w-4" strokeWidth={1.75} />
          {post._count.likes}
        </button>
        <span className="board-post-action board-post-action--static">
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          {commentCount}
        </span>

        {canEdit && (
          <div className="board-post-owner-actions">
            {isAuthor && (
              <Link
                href={`/community/${post.board.slug}/${post.id}/edit`}
                className="board-post-action"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
                수정
              </Link>
            )}
            <button
              type="button"
              className="board-post-action board-post-action--danger"
              onClick={removePost}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              삭제
            </button>
          </div>
        )}
      </div>

      <section className="board-comments">
        <h2 className="board-comments-title">댓글 {commentCount}</h2>

        {error && <p className="board-editor-error">{error}</p>}

        {user ? (
          <form className="board-comment-form" onSubmit={submitComment}>
            <textarea
              className="board-field-textarea board-field-textarea--compact"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={4}
            />
            <Button type="submit" variant="fill" disabled={loading}>
              댓글 등록
            </Button>
          </form>
        ) : (
          <div className="board-auth-gate board-auth-gate--inline">
            <p>댓글을 남기려면 로그인이 필요합니다.</p>
            <Button
              href={`/auth?next=/community/${post.board.slug}/${post.id}`}
              variant="outline"
            >
              로그인
            </Button>
          </div>
        )}

        <div className="board-comment-list">
          {post.comments.length > 0 ? (
            post.comments.map((item) => (
              <CommentItem
                key={item.id}
                comment={item}
                boardSlug={post.board.slug}
                postId={post.id}
                currentUserId={user?.id}
                userRole={user?.role}
                onChanged={reload}
              />
            ))
          ) : (
            <p className="board-comments-empty">첫 댓글을 남겨 보세요.</p>
          )}
        </div>
      </section>
    </article>
  );
}
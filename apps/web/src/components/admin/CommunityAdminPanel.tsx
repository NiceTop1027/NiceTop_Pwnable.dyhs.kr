"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type AdminCommunityPost } from "@/lib/api";
import { authorName, formatBoardDate } from "@/lib/community";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

export function CommunityAdminPanel() {
  const [posts, setPosts] = useState<AdminCommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setPosts(await adminApi.communityPosts());
  }

  useEffect(() => {
    load()
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  async function togglePin(post: AdminCommunityPost) {
    await adminApi.updateCommunityPost( post.id, {
      isPinned: !post.isPinned,
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("이 글을 삭제할까요?")) return;
    await adminApi.deleteCommunityPost( id);
    await load();
  }

  return (
    <AdminCard
      title="커뮤니티"
      description="자유게시판 · Q&A · 스터디 글을 관리합니다"
    >
      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : posts.length > 0 ? (
        <div className="admin-list">
        {posts.map((post, index) => (
          <AdminRow
            key={post.id}
            index={index}
            title={post.title}
            meta={`${post.board.name} · ${authorName(post.author)} · ${formatBoardDate(post.createdAt)} · 댓글 ${post._count.comments}`}
            badge={
              post.isPinned ? (
                <AdminBadge variant="warning">고정</AdminBadge>
              ) : undefined
            }
            actions={
              <>
                <Link
                  href={`/community/${post.board.slug}/${post.id}`}
                  className="admin-btn admin-btn-ghost"
                  target="_blank"
                >
                  보기
                </Link>
                <AdminButton
                  variant="ghost"
                  onClick={() => togglePin(post)}
                >
                  {post.isPinned ? "고정 해제" : "고정"}
                </AdminButton>
                <AdminButton variant="danger" onClick={() => remove(post.id)}>
                  삭제
                </AdminButton>
              </>
            }
          />
        ))}
        </div>
      ) : (
        <AdminEmpty message="등록된 글이 없습니다" />
      )}
    </AdminCard>
  );
}
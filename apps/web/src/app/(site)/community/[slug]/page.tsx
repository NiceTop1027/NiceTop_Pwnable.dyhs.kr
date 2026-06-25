import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import {
  authorName,
  boardHints,
  excerptContent,
  formatBoardDate,
} from "@/lib/community";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const data = await api.boardPosts(slug, 1, 1);
    return { title: data.board.name };
  } catch {
    return { title: "커뮤니티" };
  }
}

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  let data: Awaited<ReturnType<typeof api.boardPosts>> | null = null;
  try {
    data = await api.boardPosts(slug, page, 20);
  } catch {
    notFound();
  }

  const { board, posts, pagination } = data;
  const hint = boardHints[slug] ?? board.description ?? "";

  return (
    <div className="board-page pb-24">
      <FadeIn>
        <PageHeader title={board.name} description={hint}>
          <Button href={`/community/${slug}/new`} variant="fill">
            글쓰기
          </Button>
        </PageHeader>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="board-list-toolbar">
          <Link href="/community" className="board-back-link">
            ← 커뮤니티
          </Link>
          <span className="board-list-count">총 {pagination.total}개</span>
        </div>

        {posts.length > 0 ? (
          <div className="board-list">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${slug}/${post.id}`}
                className="board-list-item"
              >
                <div className="board-list-item-top">
                  <h2 className="board-list-item-title">
                    {post.isPinned && (
                      <span className="board-post-pin">고정</span>
                    )}
                    {post.title}
                  </h2>
                  <span className="board-list-item-date">
                    {formatBoardDate(post.createdAt)}
                  </span>
                </div>
                <p className="board-list-item-excerpt">
                  {excerptContent(post.content)}
                </p>
                <div className="board-list-item-meta">
                  <span>{authorName(post.author)}</span>
                  <span>조회 {post.viewCount}</span>
                  <span>댓글 {post._count.comments}</span>
                  <span>좋아요 {post._count.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="board-empty">
            <p>아직 글이 없습니다.</p>
            <Button href={`/community/${slug}/new`} variant="outline">
              첫 글 작성하기
            </Button>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <nav className="board-pagination" aria-label="페이지">
            {page > 1 && (
              <Link
                href={`/community/${slug}?page=${page - 1}`}
                className="board-pagination-link"
              >
                이전
              </Link>
            )}
            <span className="board-pagination-current">
              {page} / {pagination.totalPages}
            </span>
            {page < pagination.totalPages && (
              <Link
                href={`/community/${slug}?page=${page + 1}`}
                className="board-pagination-link"
              >
                다음
              </Link>
            )}
          </nav>
        )}
      </FadeIn>
    </div>
  );
}
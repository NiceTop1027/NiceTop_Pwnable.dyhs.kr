import { notFound } from "next/navigation";
import { FadeIn } from "@/components/pages/FadeIn";
import { PostEditor } from "@/components/community/PostEditor";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const data = await api.boardPosts(slug, 1, 1);
    return { title: `${data.board.name} · 글쓰기` };
  } catch {
    return { title: "글쓰기" };
  }
}

export default async function BoardNewPostPage({ params }: Props) {
  const { slug } = await params;

  let boardName: string;
  try {
    const data = await api.boardPosts(slug, 1, 1);
    boardName = data.board.name;
  } catch {
    notFound();
  }

  return (
    <div className="board-page pb-24">
      <FadeIn>
        <PostEditor boardSlug={slug} boardName={boardName} mode="create" />
      </FadeIn>
    </div>
  );
}
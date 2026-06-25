import { notFound } from "next/navigation";
import { FadeIn } from "@/components/pages/FadeIn";
import { PostEditor } from "@/components/community/PostEditor";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string; postId: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, postId } = await params;
  try {
    const post = await api.boardPost(slug, postId);
    return { title: `${post.title} · 수정` };
  } catch {
    return { title: "글 수정" };
  }
}

export default async function BoardPostEditPage({ params }: Props) {
  const { slug, postId } = await params;

  let post: Awaited<ReturnType<typeof api.boardPost>>;
  try {
    post = await api.boardPost(slug, postId);
  } catch {
    notFound();
  }

  return (
    <div className="board-page pb-24">
      <FadeIn>
        <PostEditor
          boardSlug={slug}
          boardName={post.board.name}
          mode="edit"
          postId={postId}
          initialTitle={post.title}
          initialContent={post.content}
        />
      </FadeIn>
    </div>
  );
}
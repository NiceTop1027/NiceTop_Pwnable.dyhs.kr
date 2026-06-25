import { notFound } from "next/navigation";
import { FadeIn } from "@/components/pages/FadeIn";
import { PostDetailView } from "@/components/community/PostDetailView";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string; postId: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, postId } = await params;
  try {
    const post = await api.boardPost(slug, postId);
    return { title: post.title };
  } catch {
    return { title: "게시글" };
  }
}

export default async function BoardPostPage({ params }: Props) {
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
        <PostDetailView initialPost={post} />
      </FadeIn>
    </div>
  );
}
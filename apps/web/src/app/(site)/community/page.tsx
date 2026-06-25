import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { PreviewList } from "@/components/pages/PreviewList";
import { api } from "@/lib/api";

export const metadata = { title: "커뮤니티" };

export default async function CommunityPage() {
  let boards: Awaited<ReturnType<typeof api.boards>> = [];

  try {
    boards = await api.boards();
  } catch {
    boards = [];
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="커뮤니티"
          description="질문하고, 공유하고, 함께 성장하는 보안 학습 커뮤니티"
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="text-eyebrow mb-6">게시판</p>
        {boards.length > 0 ? (
          <PreviewList
            items={boards.map((b) => ({
              title: b.name,
              desc: b.description ?? undefined,
              meta: `${b._count.posts}개 글`,
              href: `/community/${b.slug}`,
            }))}
          />
        ) : (
          <p className="text-body py-8 text-center">게시판을 불러올 수 없습니다</p>
        )}
      </FadeIn>
    </div>
  );
}
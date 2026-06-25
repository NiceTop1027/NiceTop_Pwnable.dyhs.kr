import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { PreviewList } from "@/components/pages/PreviewList";
import { api } from "@/lib/api";

export const metadata = { title: "공지사항" };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR");
}

export default async function NoticesPage() {
  let notices: Awaited<ReturnType<typeof api.notices>> = [];

  try {
    notices = await api.notices();
  } catch {
    notices = [];
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="공지사항"
          description="플랫폼 업데이트와 중요한 안내"
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        {notices.length > 0 ? (
          <PreviewList
            items={notices.map((n) => ({
              title: n.title,
              desc: n.content.slice(0, 80),
              meta: formatDate(n.publishedAt),
              href: `/notices/${n.id}`,
            }))}
          />
        ) : (
          <p className="text-body py-8 text-center">공지사항이 없습니다</p>
        )}
      </FadeIn>
    </div>
  );
}
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { PreviewList } from "@/components/pages/PreviewList";
import { api } from "@/lib/api";

export const metadata = { title: "강의" };

export default async function LecturesPage() {
  let categories: Awaited<ReturnType<typeof api.lectureCategories>> = [];
  let lectures: Awaited<ReturnType<typeof api.lectures>> = [];

  try {
    [categories, lectures] = await Promise.all([
      api.lectureCategories(),
      api.lectures(),
    ]);
  } catch {
    categories = [];
    lectures = [];
  }

  const grouped = categories.map((cat) => ({
    key: cat.slug,
    label: cat.name,
    items: lectures
      .filter((l) => l.category.slug === cat.slug)
      .map((l) => ({
        title: l.title,
        desc: l.description ?? undefined,
        meta: l.versions.length > 0 ? "공개" : "준비 중",
        href: l.versions.length > 0 ? `/lectures/${l.slug}` : undefined,
      })),
  }));

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="강의"
          description="Markdown 기반 포너블 강의, 초급부터 고급까지 14개 카테고리"
        />
      </FadeIn>

      {grouped.map((cat, i) =>
        cat.items.length > 0 ? (
          <FadeIn key={cat.key} delay={i * 0.05} className="mb-16">
            <p className="text-eyebrow mb-6">{cat.label}</p>
            <PreviewList items={cat.items} />
          </FadeIn>
        ) : null,
      )}

      {lectures.length === 0 && (
        <FadeIn>
          <p className="text-body py-12 text-center">
            강의 데이터를 불러올 수 없습니다. API 서버와 DB를 확인해 주세요
          </p>
        </FadeIn>
      )}
    </div>
  );
}
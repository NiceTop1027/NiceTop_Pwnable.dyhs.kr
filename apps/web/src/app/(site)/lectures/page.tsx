import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
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

  const grouped = categories
    .map((cat) => ({
      key: cat.slug,
      label: cat.name,
      description: cat.description,
      items: lectures.filter((l) => l.category.slug === cat.slug),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="doc-index pb-24">
      <FadeIn>
        <PageHeader
          title="강의"
          description="Markdown 기반 포너블 강의, 초급부터 고급까지 체계적으로 학습합니다"
        />
      </FadeIn>

      {grouped.map((cat, i) => (
        <FadeIn key={cat.key} delay={i * 0.04} className="doc-index-section">
          <div className="doc-index-heading">
            <p className="text-eyebrow">{cat.label}</p>
            {cat.description && <p className="doc-index-desc">{cat.description}</p>}
          </div>

          <ul className="doc-index-list">
            {cat.items.map((lecture) => {
              const published = lecture.versions.length > 0;
              const inner = (
                <>
                  <div className="doc-index-item-main">
                    <h2 className="doc-index-item-title">{lecture.title}</h2>
                    {lecture.description && (
                      <p className="doc-index-item-desc">{lecture.description}</p>
                    )}
                  </div>
                  <span className="doc-index-item-meta">
                    {published ? "학습 가능" : "준비 중"}
                  </span>
                </>
              );

              return (
                <li key={lecture.id} className="doc-index-item">
                  {published ? (
                    <Link href={`/lectures/${lecture.slug}`} className="doc-index-link">
                      {inner}
                    </Link>
                  ) : (
                    <div className="doc-index-link doc-index-link-disabled">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </FadeIn>
      ))}

      {lectures.length === 0 && (
        <FadeIn>
          <p className="text-body py-16 text-center">
            강의 데이터를 불러올 수 없습니다. API 서버와 DB를 확인해 주세요
          </p>
        </FadeIn>
      )}
    </div>
  );
}
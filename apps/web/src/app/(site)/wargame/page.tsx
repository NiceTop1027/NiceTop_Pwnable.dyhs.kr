import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { PreviewList } from "@/components/pages/PreviewList";
import { api } from "@/lib/api";

export const metadata = { title: "워게임" };

const categoryLabels: Record<string, string> = {
  PWN: "Pwnable",
  REV: "Reversing",
  WEB: "Web",
  CRYPTO: "Crypto",
  FORENSIC: "Forensics",
  MISC: "Misc",
  OSINT: "OSINT",
};

const difficultyLabels: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  INSANE: "Insane",
};

export default async function WargamePage() {
  let challenges: Awaited<ReturnType<typeof api.challenges>> = [];

  try {
    challenges = await api.challenges();
  } catch {
    challenges = [];
  }

  const categories = Object.entries(
    challenges.reduce<Record<string, typeof challenges>>((acc, c) => {
      const key = c.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {}),
  );

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="워게임"
          description="Docker 실습 환경에서 문제를 풀고 FLAG를 제출하세요"
        />
      </FadeIn>

      {categories.length > 0 ? (
        categories.map(([category, items], i) => (
          <FadeIn key={category} delay={i * 0.05} className="mb-16">
            <p className="text-eyebrow mb-6">
              {categoryLabels[category] ?? category}
            </p>
            <PreviewList
              items={items.map((c) => ({
                title: c.title,
                desc: c.description,
                meta: `${difficultyLabels[c.difficulty] ?? c.difficulty} · ${c.points}pt · ${c._count.solves} solved`,
                href: `/wargame/${c.slug}`,
              }))}
            />
          </FadeIn>
        ))
      ) : (
        <FadeIn delay={0.1}>
          <p className="text-body py-12 text-center">
            워게임 데이터를 불러올 수 없습니다. API 서버와 DB를 확인해 주세요
          </p>
        </FadeIn>
      )}
    </div>
  );
}
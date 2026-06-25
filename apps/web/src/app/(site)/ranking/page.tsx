import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { api } from "@/lib/api";

export const metadata = { title: "랭킹" };

const levelTitles = [
  { level: "Lv.1", title: "Newbie" },
  { level: "Lv.10", title: "Hacker" },
  { level: "Lv.20", title: "Elite Hacker" },
  { level: "Lv.30", title: "Pwn Master" },
  { level: "Lv.50", title: "Legendary Hacker" },
];

export default async function RankingPage() {
  let ranking: Awaited<ReturnType<typeof api.ranking>> = [];

  try {
    ranking = await api.ranking(20);
  } catch {
    ranking = [];
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="랭킹"
          description="경험치 기반 전체 랭킹과 분야별, 시즌별 순위"
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="text-eyebrow mb-6">전체 랭킹</p>
        <div>
          {ranking.length > 0 ? (
            ranking.map((user) => (
              <div key={user.id} className="feature-row flex items-center gap-6">
                <span className="text-caption w-8">{user.rank}</span>
                <span className="flex-1 text-[1.0625rem] text-[var(--text)]">
                  {user.displayName ?? user.username}
                </span>
                <span className="text-caption">{user.score.toLocaleString()} XP</span>
                <span className="text-caption">Lv.{user.level}</span>
                <span className="text-caption">{user._count.solves} solved</span>
              </div>
            ))
          ) : (
            <p className="text-body py-8 text-center">랭킹 데이터를 불러올 수 없습니다</p>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-20">
        <p className="text-eyebrow mb-6">레벨 시스템</p>
        <div className="grid gap-px border border-[var(--divider)] bg-[var(--divider)] sm:grid-cols-2 lg:grid-cols-3">
          {levelTitles.map((l) => (
            <div key={l.level} className="bg-black p-6">
              <p className="text-caption">{l.level}</p>
              <p className="mt-1 text-[1.0625rem] font-medium text-[var(--text)]">{l.title}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { WargameBoard } from "@/components/wargame/WargameBoard";
import { api } from "@/lib/api";

export const metadata = { title: "워게임" };

export default async function WargamePage() {
  let challenges: Awaited<ReturnType<typeof api.challenges>> = [];

  try {
    challenges = await api.challenges();
  } catch {
    challenges = [];
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="워게임"
          description="Docker 실습 환경에서 문제를 풀고 FLAG를 제출하세요"
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        {challenges.length > 0 ? (
          <WargameBoard challenges={challenges} />
        ) : (
          <p className="text-body py-12 text-center">
            워게임 데이터를 불러올 수 없습니다. API 서버와 DB를 확인해 주세요
          </p>
        )}
      </FadeIn>
    </div>
  );
}
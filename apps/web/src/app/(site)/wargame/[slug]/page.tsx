import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ChallengePublicFiles } from "@/components/challenges/ChallengePublicFiles";
import { ChallengeSolver } from "@/components/wargame/ChallengeSolver";
import { DocArticle } from "@/components/content/DocArticle";
import { FadeIn } from "@/components/pages/FadeIn";

const difficultyLabels: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  INSANE: "Insane",
};

const difficultyWeightLabels: Record<string, string> = {
  EASY: "×1",
  MEDIUM: "×1.5",
  HARD: "×2",
  INSANE: "×3",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const c = await api.challenge(slug);
    return { title: c.title };
  } catch {
    return { title: "문제" };
  }
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;

  let challenge;
  try {
    challenge = await api.challenge(slug);
  } catch {
    notFound();
  }

  const meta = `${difficultyLabels[challenge.difficulty] ?? challenge.difficulty} ${difficultyWeightLabels[challenge.difficulty] ?? ""} · ${(challenge.xpReward ?? challenge.points).toLocaleString()} XP · ${challenge._count.solves} solved`;

  return (
    <div className="pb-24">
      <DocArticle
        backHref="/wargame"
        backLabel="워게임"
        eyebrow={challenge.category}
        title={challenge.title}
        meta={meta}
        content={challenge.description}
      />

      {challenge.publicFiles && challenge.publicFiles.length > 0 && (
        <FadeIn delay={0.12} className="doc-page mt-8 max-w-lg">
          <ChallengePublicFiles files={challenge.publicFiles} />
        </FadeIn>
      )}

      <FadeIn delay={0.15} className="doc-page mt-12 max-w-md">
        <ChallengeSolver challenge={challenge} />
      </FadeIn>
    </div>
  );
}
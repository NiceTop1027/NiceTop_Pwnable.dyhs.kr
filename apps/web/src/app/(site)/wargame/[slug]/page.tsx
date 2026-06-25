import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ChallengeSolver } from "@/components/wargame/ChallengeSolver";
import { FadeIn } from "@/components/pages/FadeIn";

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

  return (
    <div className="pb-24">
      <FadeIn>
        <Link href="/wargame" className="text-caption hover:opacity-70">
          ‹ 워게임
        </Link>
        <p className="text-eyebrow mt-8 mb-3">{challenge.category}</p>
        <h1 className="text-headline-sm">{challenge.title}</h1>
        <p className="text-caption mt-4">
          {challenge.difficulty} · {challenge.points}pt · {challenge._count.solves} solved
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12">
        <div className="prose-invert max-w-none whitespace-pre-wrap text-body">
          {challenge.description}
        </div>
      </FadeIn>

      {challenge.dockerImage && (
        <FadeIn delay={0.12} className="mt-8">
          <p className="text-caption">Docker</p>
          <code className="mt-2 block rounded-xl bg-[var(--bg-muted)] p-4 font-mono text-sm">
            {challenge.dockerImage}
          </code>
        </FadeIn>
      )}

      <FadeIn delay={0.15} className="mt-12 max-w-md">
        <ChallengeSolver challenge={challenge} />
      </FadeIn>
    </div>
  );
}
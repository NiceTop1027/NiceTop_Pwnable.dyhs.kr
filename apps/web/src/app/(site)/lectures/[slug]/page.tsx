import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { FadeIn } from "@/components/pages/FadeIn";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const l = await api.lecture(slug);
    return { title: l.title };
  } catch {
    return { title: "강의" };
  }
}

export default async function LecturePage({ params }: Props) {
  const { slug } = await params;

  let lecture;
  try {
    lecture = await api.lecture(slug);
  } catch {
    notFound();
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <Link href="/lectures" className="text-caption hover:opacity-70">
          ‹ 강의
        </Link>
        <p className="text-eyebrow mt-8 mb-3">{lecture.category.name}</p>
        <h1 className="text-headline-sm">{lecture.title}</h1>
        {lecture.description && (
          <p className="text-body-lg mt-4">{lecture.description}</p>
        )}
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12">
        <article className="whitespace-pre-wrap rounded-2xl border border-[var(--divider)] bg-[var(--bg-muted)] p-8 text-body leading-relaxed">
          {lecture.content}
        </article>
      </FadeIn>
    </div>
  );
}
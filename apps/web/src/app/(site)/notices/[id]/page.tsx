import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { FadeIn } from "@/components/pages/FadeIn";

type Props = { params: Promise<{ id: string }> };

export default async function NoticePage({ params }: Props) {
  const { id } = await params;

  let notice;
  try {
    notice = await api.notice(id);
  } catch {
    notFound();
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <Link href="/notices" className="text-caption hover:opacity-70">
          ‹ 공지사항
        </Link>
        <h1 className="text-headline-sm mt-8">{notice.title}</h1>
        <p className="text-caption mt-4">
          {notice.author.displayName ?? notice.author.username} ·{" "}
          {new Date(notice.publishedAt).toLocaleDateString("ko-KR")}
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12">
        <article className="whitespace-pre-wrap text-body leading-relaxed">
          {notice.content}
        </article>
      </FadeIn>
    </div>
  );
}
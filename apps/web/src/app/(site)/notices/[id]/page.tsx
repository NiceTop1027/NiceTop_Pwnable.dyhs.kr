import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { DocArticle } from "@/components/content/DocArticle";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const notice = await api.notice(id);
    return { title: notice.title };
  } catch {
    return { title: "공지사항" };
  }
}

export default async function NoticePage({ params }: Props) {
  const { id } = await params;

  let notice;
  try {
    notice = await api.notice(id);
  } catch {
    notFound();
  }

  return (
    <DocArticle
      backHref="/notices"
      backLabel="공지사항"
      title={notice.title}
      meta={`${notice.author.displayName ?? notice.author.username} · ${new Date(notice.publishedAt).toLocaleDateString("ko-KR")}`}
      content={notice.content}
    />
  );
}
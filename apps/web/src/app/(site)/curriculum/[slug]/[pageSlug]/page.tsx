import { serverLecture } from "@/lib/api-server";
import { requireAuthLecture } from "@/lib/lecture-server";
import { LectureReader } from "@/components/lectures/LectureReader";

type Props = { params: Promise<{ slug: string; pageSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, pageSlug } = await params;
  try {
    const lecture = await serverLecture(slug, pageSlug);
    return { title: `${lecture.page.title} · ${lecture.title}` };
  } catch {
    return { title: "커리큘럼" };
  }
}

export default async function CurriculumDocSubPage({ params }: Props) {
  const { slug, pageSlug } = await params;
  const lecture = await requireAuthLecture(slug, pageSlug);
  return <LectureReader lecture={lecture} />;
}
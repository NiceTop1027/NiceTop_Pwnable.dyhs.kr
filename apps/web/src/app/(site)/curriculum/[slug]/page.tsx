import { serverLecture } from "@/lib/api-server";
import { requireAuthLecture } from "@/lib/lecture-server";
import { LectureReader } from "@/components/lectures/LectureReader";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const lecture = await serverLecture(slug);
    return { title: `${lecture.page.title} · ${lecture.title}` };
  } catch {
    return { title: "커리큘럼" };
  }
}

export default async function CurriculumDocPage({ params }: Props) {
  const { slug } = await params;
  const lecture = await requireAuthLecture(slug);
  return <LectureReader lecture={lecture} />;
}
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { LectureArticle } from "@/components/lectures/LectureArticle";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const l = await api.lecture(slug);
    return { title: l.title };
  } catch {
    return { title: "커리큘럼" };
  }
}

export default async function CurriculumDocPage({ params }: Props) {
  const { slug } = await params;

  let lecture;
  try {
    lecture = await api.lecture(slug);
  } catch {
    notFound();
  }

  return (
    <LectureArticle
      title={lecture.title}
      description={lecture.description}
      category={lecture.category.name}
      content={lecture.content}
    />
  );
}
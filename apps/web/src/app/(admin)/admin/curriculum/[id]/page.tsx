import { LectureEditor } from "@/components/admin/LectureEditor";

export const metadata = { title: "커리큘럼 편집" };

export default async function AdminCurriculumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LectureEditor lectureId={id} />;
}
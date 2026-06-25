import { LectureEditor } from "@/components/admin/LectureEditor";

export const metadata = { title: "강의 편집" };

export default async function AdminLectureEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LectureEditor lectureId={id} />;
}
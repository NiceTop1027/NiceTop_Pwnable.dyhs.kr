import { CurriculumTrackEditor } from "@/components/admin/CurriculumTrackEditor";

export const metadata = { title: "커리큘럼 트랙 편집" };

export default async function AdminCurriculumTrackEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CurriculumTrackEditor trackId={id} />;
}
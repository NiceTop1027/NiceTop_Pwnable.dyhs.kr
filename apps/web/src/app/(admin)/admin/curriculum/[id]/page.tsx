import { CurriculumEditor } from "@/components/admin/CurriculumEditor";

export const metadata = { title: "커리큘럼 편집" };

export default async function AdminCurriculumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CurriculumEditor curriculumId={id} />;
}
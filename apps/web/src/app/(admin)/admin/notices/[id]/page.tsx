import { NoticeEditor } from "@/components/admin/NoticeEditor";

export const metadata = { title: "공지 편집" };

export default async function AdminNoticeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NoticeEditor noticeId={id} />;
}
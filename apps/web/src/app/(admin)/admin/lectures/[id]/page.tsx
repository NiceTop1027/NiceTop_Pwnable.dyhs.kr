import { redirect } from "next/navigation";

export default async function AdminLecturesEditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/curriculum/${id}`);
}
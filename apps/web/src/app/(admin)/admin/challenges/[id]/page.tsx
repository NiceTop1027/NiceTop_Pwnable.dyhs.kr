import { ChallengeEditor } from "@/components/admin/ChallengeEditor";

export const metadata = { title: "문제 편집" };

export default async function AdminChallengeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChallengeEditor challengeId={id} />;
}
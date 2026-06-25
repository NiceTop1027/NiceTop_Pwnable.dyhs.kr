import { notFound } from "next/navigation";
import { PublicProfileContent } from "@/components/user/PublicProfileContent";
import { api } from "@/lib/api";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  try {
    const profile = await api.userProfile(username);
    return {
      title: `${profile.displayName ?? profile.username} · 프로필`,
    };
  } catch {
    return { title: "프로필" };
  }
}

export default async function PublicUserProfilePage({ params }: Props) {
  const { username } = await params;

  let profile: Awaited<ReturnType<typeof api.userProfile>>;
  try {
    profile = await api.userProfile(username);
  } catch {
    notFound();
  }

  return (
    <div className="profile-site pb-24">
      <PublicProfileContent profile={profile} />
    </div>
  );
}
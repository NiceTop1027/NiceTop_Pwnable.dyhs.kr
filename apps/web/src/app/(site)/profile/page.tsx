import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { ProfileContent } from "@/components/auth/ProfileContent";

export const metadata = { title: "프로필" };

export default function ProfilePage() {
  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="프로필"
          description="학습 진도, 업적, 풀이 기록을 확인하세요"
        />
      </FadeIn>

      <ProfileContent />
    </div>
  );
}
import { CurriculumTrackAdminPanel } from "@/components/admin/CurriculumTrackAdminPanel";
import { LectureAdminPanel } from "@/components/admin/LectureAdminPanel";

export const metadata = { title: "커리큘럼 관리" };

export default function AdminCurriculumPage() {
  return (
    <div className="admin-curriculum-page">
      <CurriculumTrackAdminPanel />
      <LectureAdminPanel />
    </div>
  );
}
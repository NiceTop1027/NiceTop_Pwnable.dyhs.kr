import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  Puzzle,
  Route,
  ScrollText,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const adminNav: AdminNavItem[] = [
  {
    href: "/admin",
    label: "대시보드",
    icon: LayoutDashboard,
    description: "플랫폼 현황을 한눈에 확인합니다",
  },
  {
    href: "/admin/challenges",
    label: "문제",
    icon: Puzzle,
    description: "워게임 문제를 생성하고 관리합니다",
  },
  {
    href: "/admin/lectures",
    label: "강의",
    icon: BookOpen,
    description: "Notion 스타일 에디터로 강의를 작성합니다",
  },
  {
    href: "/admin/curriculum",
    label: "커리큘럼",
    icon: Route,
    description: "Notion 스타일 에디터로 학습 문서를 작성합니다",
  },
  {
    href: "/admin/notices",
    label: "공지",
    icon: Bell,
    description: "공지사항을 등록하고 관리합니다",
  },
  {
    href: "/admin/users",
    label: "회원",
    icon: Users,
    description: "회원 권한과 계정 상태를 관리합니다",
  },
  {
    href: "/admin/logs",
    label: "로그",
    icon: ScrollText,
    description: "관리자 작업 기록을 확인합니다",
  },
];

export function getAdminPageMeta(pathname: string) {
  const exact = adminNav.find((item) => item.href === pathname);
  if (exact) return exact;

  const nested = adminNav.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  );
  return nested ?? adminNav[0];
}
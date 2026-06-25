export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const mainNav: NavItem[] = [
  { label: "홈", href: "/", description: "메인 페이지" },
  { label: "강의", href: "/lectures", description: "동영상 강의" },
  { label: "커리큘럼", href: "/curriculum", description: "학습 로드맵" },
  { label: "워게임", href: "/wargame", description: "실습 문제" },
  { label: "CTF", href: "/ctf", description: "대회 & 챌린지" },
  { label: "랭킹", href: "/ranking", description: "리더보드" },
  { label: "커뮤니티", href: "/community", description: "게시판 & 토론" },
  { label: "공지사항", href: "/notices", description: "플랫폼 소식" },
  { label: "프로필", href: "/profile", description: "내 정보" },
  { label: "관리자", href: "/admin", description: "관리 콘솔" },
];

export const levelTitles: Record<number, string> = {
  1: "뉴비",
  2: "입문자",
  3: "초보 해커",
  4: "중급 해커",
  5: "숙련자",
  6: "고급 해커",
  7: "엘리트",
  8: "마스터",
  9: "그랜드마스터",
  10: "레전드",
};

export function getLevelTitle(level: number): string {
  if (level <= 0) return "미등록";
  if (level > 10) return levelTitles[10];
  return levelTitles[level] ?? `Lv.${level}`;
}
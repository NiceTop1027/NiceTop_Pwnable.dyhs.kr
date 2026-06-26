import { contentToPlainText } from "./content-text";

export const boardHints: Record<string, string> = {
  free: "자유롭게 이야기하고 정보를 나눠 보세요.",
  qna: "궁금한 점을 질문하고 서로 답변해 보세요.",
  study: "스터디 모집·후기·자료를 공유하는 공간입니다.",
};

export function formatBoardDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function excerptContent(content: string, max = 120) {
  const text = contentToPlainText(content);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function authorName(author: {
  displayName: string | null;
  username: string;
}) {
  return author.displayName ?? author.username;
}

export function userProfilePath(username: string) {
  return `/users/${encodeURIComponent(username)}`;
}
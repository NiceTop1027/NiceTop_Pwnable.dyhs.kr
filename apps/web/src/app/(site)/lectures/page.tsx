import { redirect } from "next/navigation";

export const metadata = { title: "강의" };

/** 강의 목록은 커리큘럼으로 통합 — 개별 문서는 /curriculum/[slug] */
export default function LecturesIndexPage() {
  redirect("/curriculum");
}
"use client";

import { ScrollPinSequence, ScrollPinStatement } from "@/components/animations/ScrollPinSequence";

const chapters = [
  {
    headline: "강의",
    subline: "Linux부터 Kernel Pwn까지, 체계적인 커리큘럼으로 기초를 다집니다",
  },
  {
    headline: "워게임",
    subline: "Docker 실습 환경에서 직접 exploit을 작성하고 FLAG를 제출하세요",
  },
  {
    headline: "CTF",
    subline: "개인전, 팀전, 실시간 스코어보드로 전국 학생과 겨루세요",
  },
  {
    headline: "커뮤니티",
    subline: "질문하고, 공유하고, 함께 성장하는 보안 학습 커뮤니티",
  },
];

export function ScrollStory() {
  return (
    <div>
      <ScrollPinSequence items={chapters} height="500vh" />

      <ScrollPinStatement
        eyebrow="올인원 플랫폼"
        headline={
          <>
            <span>DreamHack</span>
            <span aria-hidden>·</span>
            <span>pwn.college</span>
            <span aria-hidden>·</span>
            <span>CTFd</span>
          </>
        }
        body="세 가지 플랫폼의 장점을 하나로 — 강의는 pwn.college처럼, 실습은 DreamHack처럼, 대회는 CTFd처럼"
        height="280vh"
      />
    </div>
  );
}
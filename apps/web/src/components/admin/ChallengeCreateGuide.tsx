import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { AdminCard } from "./ui/AdminCard";

const FLOW = [
  { label: "생성", desc: "Repository 등록" },
  { label: "업로드", desc: "ZIP · 검증 · 빌드" },
  { label: "테스트", desc: "nc 접속 확인" },
  { label: "공개", desc: "워게임 노출" },
];

const REQUIRED = [
  { file: "Specfile", desc: "제목, FLAG, tags, VM 설정" },
  { file: "Description.md", desc: "문제 설명 (Markdown)" },
  { file: "public/", desc: "유저가 받는 파일" },
  { file: "Dockerfile", desc: "원격 인스턴스 문제만" },
];

const OPTIONAL = [
  { file: "deploy/", desc: "컨테이너에 넣을 바이너리·플래그" },
  { file: "private/", desc: "출제자용 소스·풀이 (비공개)" },
];

export function ChallengeCreateGuide() {
  return (
    <div className="challenge-guide">
      <Link href="/admin/challenges" className="challenge-guide__back">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        문제 목록
      </Link>

      <header className="challenge-guide__header">
        <h1 className="challenge-guide__title">워게임 출제</h1>
        <p className="challenge-guide__lead">
          DreamHack Repository 형식 그대로 사용합니다. ZIP 업로드 시 Specfile과
          Description.md가 자동 반영되고, public/ 파일은 유저에게 제공됩니다.
        </p>
        <div className="challenge-guide__cta">
          <Link href="/admin/challenges/new" className="admin-btn admin-btn-primary">
            문제 생성
          </Link>
          <a
            href="/samples/wargame-repository.zip"
            download
            className="admin-btn admin-btn-ghost"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            샘플 ZIP
          </a>
        </div>
      </header>

      <AdminCard>
        <div className="challenge-guide__flow" aria-label="출제 순서">
          {FLOW.map((step, i) => (
            <div key={step.label} className="challenge-guide__flow-step">
              <span className="challenge-guide__flow-index">{i + 1}</span>
              <span className="challenge-guide__flow-label">{step.label}</span>
              <span className="challenge-guide__flow-desc">{step.desc}</span>
            </div>
          ))}
        </div>

        <section className="challenge-guide__section">
          <h2 className="challenge-guide__section-title">Repository 구조</h2>
          <pre className="challenge-guide__pre">{`repository/
├── Specfile
├── Description.md
├── Dockerfile
├── deploy/
├── public/
└── private/`}</pre>
        </section>

        <section className="challenge-guide__section">
          <h2 className="challenge-guide__section-title">필수</h2>
          <dl className="challenge-guide__defs">
            {REQUIRED.map((item) => (
              <div key={item.file} className="challenge-guide__def">
                <dt>{item.file}</dt>
                <dd>{item.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="challenge-guide__section">
          <h2 className="challenge-guide__section-title">선택</h2>
          <dl className="challenge-guide__defs">
            {OPTIONAL.map((item) => (
              <div key={item.file} className="challenge-guide__def">
                <dt>{item.file}</dt>
                <dd>{item.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="challenge-guide__section">
          <h2 className="challenge-guide__section-title">Specfile</h2>
          <pre className="challenge-guide__pre">{`[wargame]
title = FNotes
flag = DYHS{real_flag}
tags = pwnable

[vm]
os = linux
memory = 128
disk = 256
ports = 8080/tcp
allow_outgoing = false
docker_compose = false`}</pre>
          <p className="challenge-guide__text">
            <code>[vm] ports</code>가 있으면 원격 인스턴스가 켜집니다. 유저 접속
            포트는 10000번대에서 자동 배정됩니다.
          </p>
        </section>

        <footer className="challenge-guide__footer">
          <p className="challenge-guide__footer-label">확인</p>
          <ul className="challenge-guide__notes">
            <li>업로드 시 Specfile · Description.md · public/ 검증</li>
            <li>공개 후 삭제 불가 — 배포 전 직접 풀어볼 것</li>
            <li>private/는 유저에게 노출되지 않음</li>
          </ul>
        </footer>
      </AdminCard>
    </div>
  );
}
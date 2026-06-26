import Link from "next/link";
import { Download } from "lucide-react";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminCard } from "./ui/AdminCard";
import { AdminRow } from "./ui/AdminRow";

const STEPS = [
  {
    title: "새 문제",
    desc: "Repository slug를 등록합니다. 제목·FLAG는 편집기에서 수정합니다.",
  },
  {
    title: "ZIP 업로드",
    desc: "편집기 하단 배포 패널에서 Repository ZIP을 올리면 검증 후 빌드됩니다.",
  },
  {
    title: "접속 확인",
    desc: "인스턴스 문제는 nc로 직접 풀어본 뒤 공개합니다.",
  },
  {
    title: "공개",
    desc: "문제 목록에서 공개로 전환합니다. 공개 후에는 삭제할 수 없습니다.",
  },
];

const FILES = [
  { name: "Specfile", required: true, desc: "제목, FLAG, tags, VM 설정" },
  { name: "Description.md", required: true, desc: "문제 설명 (Markdown)" },
  { name: "public/", required: true, desc: "유저가 다운로드하는 파일" },
  { name: "Dockerfile", required: true, desc: "원격 인스턴스 문제 ([vm] ports)" },
  { name: "deploy/", required: false, desc: "컨테이너에 복사되는 바이너리·플래그" },
  { name: "private/", required: false, desc: "출제자용 소스·풀이 (비공개)" },
];

const REPO_TREE = `repository/
├── Specfile
├── Description.md
├── Dockerfile
├── deploy/
├── public/
└── private/`;

const SPECFILE_SAMPLE = `[wargame]
title = FNotes
flag = DYHS{change_me}
tags = pwnable

[vm]
os = linux
memory = 128
disk = 256
ports = 8080/tcp
allow_outgoing = false
docker_compose = false`;

const NOTES = [
  "업로드 시 Specfile, Description.md, public/을 검증합니다.",
  "private/는 빌드에만 사용되고 유저에게 노출되지 않습니다.",
  "[vm] ports가 있으면 빌드 후 인스턴스가 켜지고, 접속 포트는 10000번대에서 자동 배정됩니다.",
];

export function ChallengeCreateGuide() {
  return (
    <>
      <AdminCard
        title="워게임 출제"
        description="ZIP 한 번으로 메타데이터 반영 · 빌드 · 인스턴스 설정까지 진행됩니다"
      >
        <div className="admin-form-actions challenge-guide-toolbar">
          <Link href="/admin/challenges/new" className="admin-btn admin-btn-primary">
            새 문제
          </Link>
          <Link href="/admin/challenges" className="admin-btn admin-btn-ghost">
            목록
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

        <ol className="admin-doc-steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <strong>
                {index + 1}. {step.title}
              </strong>
              <span> — {step.desc}</span>
            </li>
          ))}
        </ol>
      </AdminCard>

      <AdminCard title="Repository 구조">
        <pre className="admin-code-block">{REPO_TREE}</pre>
      </AdminCard>

      <AdminCard title="파일">
        {FILES.map((file) => (
          <AdminRow
            key={file.name}
            title={<span className="admin-code-inline">{file.name}</span>}
            meta={file.desc}
            badge={
              <AdminBadge variant={file.required ? "warning" : "default"}>
                {file.required ? "필수" : "선택"}
              </AdminBadge>
            }
          />
        ))}
      </AdminCard>

      <AdminCard
        title="Specfile"
        description="[vm] ports가 없으면 로컬 문제로 등록됩니다"
      >
        <pre className="admin-code-block">{SPECFILE_SAMPLE}</pre>
      </AdminCard>

      <AdminCard title="확인 사항">
        <ul className="admin-doc-notes">
          {NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </AdminCard>
    </>
  );
}
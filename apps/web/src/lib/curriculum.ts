export type CurriculumTrack = {
  slug: string;
  name: string;
  label: string;
  desc: string;
  content?: unknown;
  steps: { title: string; desc?: string; href?: string }[];
};

export const DEFAULT_CURRICULUM_TRACKS: CurriculumTrack[] = [
  {
    slug: "beginner",
    name: "BEGINNER",
    label: "입문",
    desc: "바이너리 익스플로잇을 처음 시작하는 학생을 위한 기초 과정",
    steps: [
      { title: "Linux 기초", desc: "셸, 권한, 프로세스 이해" },
      { title: "C Language", desc: "포인터와 메모리 구조" },
      { title: "Assembly", desc: "디스어셈블리와 레지스터" },
      { title: "Memory", desc: "스택·힙 레이아웃" },
    ],
  },
  {
    slug: "intermediate",
    name: "INTERMEDIATE",
    label: "중급",
    desc: "ROP, 힙 익스플로잇 등 실전 기법을 익히는 과정",
    steps: [
      { title: "Stack BOF", desc: "기본 버퍼 오버플로우" },
      { title: "Shellcode", desc: "직접 쉘코드 작성" },
      { title: "Return-to-libc", desc: "libc 함수 활용" },
      { title: "ROP Chain", desc: "가젯 체인 구성" },
    ],
  },
  {
    slug: "advanced",
    name: "ADVANCED",
    label: "고급",
    desc: "커널·브라우저 등 고급 익스플로잇 영역으로 확장",
    steps: [
      { title: "Heap Exploitation", desc: "Use-after-free, tcache" },
      { title: "Kernel Pwn", desc: "커널 모듈·드라이버" },
      { title: "Browser Security", desc: "JIT, sandbox 우회" },
    ],
  },
];

const tierLabels: Record<string, string> = {
  BEGINNER: "입문",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  EXPERT: "전문",
};

function findDefaultTrack(track: CurriculumTrack) {
  return DEFAULT_CURRICULUM_TRACKS.find(
    (d) =>
      d.slug === track.slug ||
      d.name === track.name ||
      d.label === track.label,
  );
}

/** 홈 커리큘럼 섹션용 — API 데이터가 비어 있으면 기본 3-Track 로드맵 사용 */
export function resolveHomeCurriculumTracks(tracks: CurriculumTrack[]): CurriculumTrack[] {
  if (tracks.length === 0) return DEFAULT_CURRICULUM_TRACKS;

  const enriched = tracks.map((track) => {
    if (track.steps.length > 0) return track;
    const fallback = findDefaultTrack(track);
    if (!fallback) return track;
    return {
      ...track,
      desc: track.desc || fallback.desc,
      steps: fallback.steps,
    };
  });

  const hasSteps = enriched.some((t) => t.steps.length > 0);
  return hasSteps ? enriched : DEFAULT_CURRICULUM_TRACKS;
}

export function mapCurriculaToTracks(
  curricula: {
    slug: string;
    title: string;
    description: string | null;
    content?: unknown;
    tier: string;
    items: {
      lecture: {
        title: string;
        slug: string;
        description: string | null;
      } | null;
      challenge: {
        title: string;
        slug: string;
      } | null;
    }[];
  }[],
): CurriculumTrack[] {
  return curricula.map((c) => ({
    slug: c.slug,
    name: c.tier,
    label: tierLabels[c.tier] ?? c.title,
    desc: c.description ?? "",
    content: c.content,
    steps: c.items.map((item) => {
      if (item.lecture) {
        return {
          title: item.lecture.title,
          desc: item.lecture.description ?? undefined,
          href: `/lectures/${item.lecture.slug}`,
        };
      }
      if (item.challenge) {
        return {
          title: item.challenge.title,
          href: `/wargame/${item.challenge.slug}`,
        };
      }
      return { title: "항목" };
    }),
  }));
}
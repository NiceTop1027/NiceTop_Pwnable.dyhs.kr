export type CurriculumTrack = {
  slug: string;
  name: string;
  label: string;
  desc: string;
  content?: unknown;
  steps: { title: string; desc?: string; href?: string }[];
};

const tierLabels: Record<string, string> = {
  BEGINNER: "입문",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  EXPERT: "전문",
};

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
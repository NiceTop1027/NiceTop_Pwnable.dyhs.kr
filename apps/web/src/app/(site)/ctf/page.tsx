import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { PreviewList } from "@/components/pages/PreviewList";
import { api } from "@/lib/api";

export const metadata = { title: "CTF" };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CtfPage() {
  let events: Awaited<ReturnType<typeof api.ctfEvents>> = [];

  try {
    events = await api.ctfEvents();
  } catch {
    events = [];
  }

  return (
    <div className="pb-24">
      <FadeIn>
        <PageHeader
          title="CTF"
          description="개인전과 팀전 CTF 대회에 참가하고 실시간으로 점수를 겨루세요"
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="text-eyebrow mb-6">예정된 대회</p>
        {events.length > 0 ? (
          <PreviewList
            items={events.map((e) => ({
              title: e.title,
              desc: e.description ?? undefined,
              meta: `${formatDate(e.startAt)} · ${e._count.challenges}문제`,
            }))}
          />
        ) : (
          <p className="text-body py-8 text-center">예정된 대회가 없습니다</p>
        )}
      </FadeIn>

      <FadeIn delay={0.15} className="mt-16">
        <div className="grid gap-px border border-[var(--divider)] bg-[var(--divider)] sm:grid-cols-2">
          {[
            { label: "개인전", desc: "솔로로 참가" },
            { label: "팀전", desc: "팀을 구성해 참가" },
          ].map((m) => (
            <div key={m.label} className="bg-black p-8">
              <p className="text-[1.0625rem] font-medium text-[var(--text)]">{m.label}</p>
              <p className="text-body mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
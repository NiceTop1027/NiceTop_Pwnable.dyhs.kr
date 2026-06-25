"use client";

import Image from "next/image";
import Link from "next/link";

type Partner = {
  name: string;
  role?: string;
  logo?: string;
  href?: string;
  textOnly?: boolean;
  logoSize?: "default" | "wide";
};

const partners: Partner[] = [
  {
    name: "NiceTop",
    role: "대표 협력기관",
    textOnly: true,
    href: "/",
  },
  {
    name: "덕영고등학교",
    logo: "/partners/deokyoung-logo.png",
    href: "https://dukyoung-h.goeyi.kr",
  },
  {
    name: "TEAM H4C",
    role: "덕영고 협력기관",
    logo: "/partners/teamh4c-logo.svg",
    logoSize: "wide",
    href: "https://h4c.team",
  },
];

function PartnerItem({ partner }: { partner: Partner }) {
  const content = (
    <>
      {partner.textOnly ? (
        <span className="text-[1.25rem] font-semibold tracking-tight text-[var(--text)] transition-opacity duration-300 group-hover:opacity-70 sm:text-[1.375rem]">
          {partner.name}
        </span>
      ) : partner.logoSize === "wide" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo}
          alt={`${partner.name} 로고`}
          className="h-16 w-auto shrink-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-20"
        />
      ) : (
        <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
          <Image
            src={partner.logo!}
            alt={`${partner.name} 로고`}
            fill
            className="object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            sizes="64px"
          />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {!partner.textOnly && partner.logoSize !== "wide" && (
          <span className="whitespace-nowrap text-[1.0625rem] text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-[var(--text)]">
            {partner.name}
          </span>
        )}
        {partner.role && (
          <span className="text-caption whitespace-nowrap text-[var(--text-secondary)]">
            {partner.role}
          </span>
        )}
      </div>
    </>
  );

  const className = "partner-item group flex shrink-0 items-center gap-5";

  if (partner.href) {
    const isExternal = partner.href.startsWith("http");

    return (
      <Link
        href={partner.href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function PartnersSection() {
  const track = [...partners, ...partners];

  return (
    <section className="border-y border-[var(--divider)] bg-black py-16">
      <p className="text-eyebrow mb-10 text-center">협력</p>

      <div className="partners-marquee-mask relative overflow-hidden">
        <div className="partners-marquee-track flex items-center">
          {track.map((partner, i) => (
            <PartnerItem key={`${partner.name}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
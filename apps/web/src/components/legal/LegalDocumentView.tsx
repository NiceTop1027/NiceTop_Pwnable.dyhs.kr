import Link from "next/link";
import type { LegalDocument } from "@/lib/legal";
import { LEGAL_LINKS } from "@/lib/legal";
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";

type LegalDocumentViewProps = {
  document: LegalDocument;
  activeHref: string;
};

export function LegalDocumentView({
  document,
  activeHref,
}: LegalDocumentViewProps) {
  return (
    <div className="legal-page">
      <FadeIn>
        <PageHeader
          title={document.title}
          description={document.description}
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <nav className="legal-nav" aria-label="정책 문서">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`legal-nav-link${item.href === activeHref ? " legal-nav-link--active" : ""}`}
              aria-current={item.href === activeHref ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </FadeIn>

      <FadeIn delay={0.1}>
        <article className="legal-doc">
          <p className="legal-effective">시행일: {document.effectiveDate}</p>

          {document.sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2 className="legal-section-title">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="legal-paragraph">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="legal-list">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </FadeIn>
    </div>
  );
}
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/pages/FadeIn";
import { LEGAL_LINKS } from "@/lib/legal";

export const metadata = {
  title: "문의하기",
  description: "서비스 이용, 계정, 개인정보 관련 문의를 접수합니다.",
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <FadeIn>
        <PageHeader
          title="문의하기"
          description="이용 중 불편한 점이나 제안, 개인정보 관련 요청을 남겨 주세요."
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <nav className="legal-nav" aria-label="정책 문서">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`legal-nav-link${item.href === "/contact" ? " legal-nav-link--active" : ""}`}
              aria-current={item.href === "/contact" ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="contact-panel">
          <ContactForm />
        </div>
      </FadeIn>
    </div>
  );
}
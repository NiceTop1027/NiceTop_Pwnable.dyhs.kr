import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { privacyPolicy } from "@/lib/legal";

export const metadata = {
  title: "개인정보 처리방침",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentView document={privacyPolicy} activeHref="/legal/privacy" />
  );
}
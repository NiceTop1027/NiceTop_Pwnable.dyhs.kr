import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsOfService } from "@/lib/legal";

export const metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  return (
    <LegalDocumentView document={termsOfService} activeHref="/legal/terms" />
  );
}
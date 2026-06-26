import PageHeader from "@/components/ui/PageHeader";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <PageHeader eyebrow="관리 콘솔" title={title} description={description}>
      {children}
    </PageHeader>
  );
}
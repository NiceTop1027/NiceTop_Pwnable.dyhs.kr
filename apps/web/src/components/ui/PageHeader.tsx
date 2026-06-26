import type { LucideIcon } from "lucide-react";

import { SITE_NAME } from "@/lib/site";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  eyebrow = SITE_NAME,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-12">
      <p className="text-eyebrow mb-3">{eyebrow}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-sm">{title}</h1>
          {description && (
            <p className="text-body-lg mt-4 max-w-lg">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
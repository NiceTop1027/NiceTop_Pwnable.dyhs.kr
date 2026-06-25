import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="py-20 text-center">
      <p className="text-eyebrow mb-4">Coming Soon</p>
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-[var(--text)]">
        {title}
      </h2>
      <p className="text-body mx-auto mt-4 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <div className="mt-10">
          <Button href={actionHref} variant="outline">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
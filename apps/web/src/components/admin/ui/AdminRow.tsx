import type { ReactNode } from "react";

export function AdminRow({
  title,
  meta,
  badge,
  actions,
}: {
  title: string;
  meta?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="admin-row">
      <div className="admin-row-main">
        <div className="admin-row-top">
          <p className="admin-row-title">{title}</p>
          {badge}
        </div>
        {meta && <p className="admin-row-meta">{meta}</p>}
      </div>
      {actions && <div className="admin-row-actions">{actions}</div>}
    </div>
  );
}
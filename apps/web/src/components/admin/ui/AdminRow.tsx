import type { ReactNode } from "react";

export function AdminRow({
  title,
  meta,
  badge,
  actions,
  index,
}: {
  title: ReactNode;
  meta?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  index?: number;
}) {
  return (
    <div className="admin-list-row">
      {typeof index === "number" && (
        <span className="admin-list-index">{String(index + 1).padStart(2, "0")}</span>
      )}
      <div className="admin-list-row-main">
        <div className="admin-list-row-top">
          <p className="admin-list-row-title">{title}</p>
          {badge}
        </div>
        {meta && <p className="admin-list-row-meta">{meta}</p>}
      </div>
      {actions && <div className="admin-list-row-actions">{actions}</div>}
    </div>
  );
}
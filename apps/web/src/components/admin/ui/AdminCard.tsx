import type { ReactNode } from "react";

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card ${className}`}>
      {(title || description) && (
        <div className="admin-card-header">
          {title && <h3 className="admin-card-title">{title}</h3>}
          {description && (
            <p className="admin-card-description">{description}</p>
          )}
        </div>
      )}
      <div className="admin-card-body">{children}</div>
    </section>
  );
}
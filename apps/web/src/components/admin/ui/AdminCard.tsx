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
    <section className={`admin-section ${className}`}>
      {(title || description) && (
        <header className="admin-section-header">
          {title && <h2 className="admin-section-title">{title}</h2>}
          {description && (
            <p className="admin-section-description">{description}</p>
          )}
        </header>
      )}
      <div className="admin-section-body">{children}</div>
    </section>
  );
}
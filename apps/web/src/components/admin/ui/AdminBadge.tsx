export function AdminBadge({
  variant = "default",
  children,
}: {
  variant?: "default" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <span className={`admin-badge admin-badge-${variant}`}>{children}</span>
  );
}
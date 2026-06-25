export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="admin-page-header">
      <h2 className="admin-page-title">{title}</h2>
      <p className="admin-page-description">{description}</p>
    </header>
  );
}
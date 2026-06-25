export default function AdminSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-site">{children}</div>;
}
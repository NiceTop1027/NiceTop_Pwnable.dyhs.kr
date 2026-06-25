export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-container min-h-[80vh] pt-20 pb-8">{children}</div>;
}
import Link from "next/link";

interface PreviewItem {
  title: string;
  desc?: string;
  meta?: string;
  href?: string;
}

export function PreviewList({ items }: { items: PreviewItem[] }) {
  return (
    <div>
      {items.map((item) => {
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[1.0625rem] font-medium text-[var(--text)] transition-opacity group-hover:opacity-60">
                {item.title}
              </h3>
              {item.meta && (
                <span className="text-caption shrink-0">{item.meta}</span>
              )}
            </div>
            {item.desc && <p className="text-body mt-1">{item.desc}</p>}
          </>
        );

        if (item.href) {
          return (
            <Link key={item.title} href={item.href} className="feature-row group block">
              {inner}
            </Link>
          );
        }

        return (
          <div key={item.title} className="feature-row">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
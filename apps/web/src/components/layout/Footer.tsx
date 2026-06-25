import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { LEGAL_LINKS } from "@/lib/legal";
import { mainNav } from "@/lib/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--divider)] bg-black">
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-tertiary)]">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-60"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 text-xs text-[var(--text-tertiary)] sm:flex-row">
            <p>Copyright © {year} {SITE_NAME}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {mainNav.slice(1, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-opacity hover:opacity-60"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
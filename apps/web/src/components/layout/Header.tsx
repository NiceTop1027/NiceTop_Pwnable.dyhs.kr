"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/lib/navigation";
import { HeaderAuth } from "@/components/layout/HeaderAuth";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "header-nav" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-6">
        <Link
          href="/"
          className="text-[1.0625rem] font-medium tracking-tight text-[var(--text)]"
        >
          pwnable.dyhs.kr
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {mainNav.slice(1, 7).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs transition-opacity hover:opacity-60"
              style={{
                color: isActive(item.href) ? "var(--text)" : "var(--text-secondary)",
                opacity: isActive(item.href) ? 1 : undefined,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <HeaderAuth />
        </div>

        <button
          type="button"
          className="text-[var(--text-secondary)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--divider)] bg-black/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col px-6 py-6">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[var(--divider)] py-4 text-[1.0625rem]"
                  style={{
                    color: isActive(item.href) ? "var(--text)" : "var(--text-secondary)",
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <HeaderAuth mobile />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/pages/FadeIn";
import { adminNav, getAdminPageMeta } from "@/lib/admin-nav";
import { SITE_NAME } from "@/lib/site";
import { useAuth } from "@/providers/AuthProvider";
import { AdminPageHeader } from "./ui/AdminPageHeader";

function isDocumentEditorRoute(pathname: string) {
  if (pathname.endsWith("/guide")) return false;
  return /^\/admin\/(curriculum|notices|challenges)\/(new|[^/]+)$/.test(pathname);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const meta = getAdminPageMeta(pathname);
  const { user, logout } = useAuth();
  const editorMode = isDocumentEditorRoute(pathname);

  if (editorMode) {
    return <div className="admin-editor-root">{children}</div>;
  }

  return (
    <div className="admin-root">
      <div className="admin-ambient" aria-hidden />

      <nav className="admin-mobile-nav" aria-label="관리자 메뉴">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-mobile-nav-item ${active ? "admin-mobile-nav-item-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-top">
            <Link href="/" className="admin-sidebar-brand">
              {SITE_NAME}
            </Link>
            <Link href="/" className="admin-sidebar-site-link">
              사이트 보기
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <nav className="admin-sidebar-nav" aria-label="관리자 메뉴">
            {adminNav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${active ? "admin-nav-item-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="admin-nav-icon" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <p className="admin-sidebar-user">
              {user?.displayName ?? user?.username}
            </p>
            <button
              type="button"
              className="admin-sidebar-logout"
              onClick={() => logout()}
            >
              로그아웃
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-content">
            <AdminPageHeader title={meta.label} description={meta.description} />
            <FadeIn delay={0.06}>{children}</FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
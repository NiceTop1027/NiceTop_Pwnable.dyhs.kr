"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { adminNav, getAdminPageMeta } from "@/lib/admin-nav";
import { useAuth } from "@/providers/AuthProvider";
import { AdminPageHeader } from "./ui/AdminPageHeader";

function isDocumentEditorRoute(pathname: string) {
  return /^\/admin\/curriculum\/(new|[^/]+)$/.test(pathname);
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
          <Link href="/" className="admin-sidebar-brand">
            pwnable.dyhs.kr
          </Link>
          <p className="admin-sidebar-eyebrow">관리 콘솔</p>
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
            <p className="admin-sidebar-role">{user?.role}</p>
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
          <AdminPageHeader title={meta.label} description={meta.description} />
          {children}
        </div>
      </div>
    </div>
  );
}
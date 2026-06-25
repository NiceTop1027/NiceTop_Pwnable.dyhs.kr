"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const tabs = [
  { href: "/auth/login", label: "로그인" },
  { href: "/auth/register", label: "회원가입" },
] as const;

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  const pathname = usePathname();

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="auth-card"
      >
        <Link href="/" className="auth-brand">
          pwnable.dyhs.kr
        </Link>

        <nav className="auth-tabs" aria-label="인증 메뉴">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`auth-tab ${active ? "auth-tab-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
        </div>

        {children}

        <div className="auth-footer">{footer}</div>
      </motion.div>
    </div>
  );
}
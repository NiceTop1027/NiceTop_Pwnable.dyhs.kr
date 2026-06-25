"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export type AuthMode = "login" | "register";

const tabs: { id: AuthMode; label: string }[] = [
  { id: "login", label: "로그인" },
  { id: "register", label: "회원가입" },
];

const copy: Record<AuthMode, { title: string; description: string }> = {
  login: {
    title: "다시 오신 것을 환영합니다",
    description: "로그인하고 강의 · 워게임 · CTF를 이어가세요",
  },
  register: {
    title: "학습을 시작하세요",
    description: "무료로 가입하고 포너블 학습을 시작할 수 있습니다",
  },
};

const slideEase = [0.32, 0.72, 0, 1] as const;

const formVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

const textVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

interface AuthShellProps {
  mode: AuthMode;
  direction: number;
  onModeChange: (mode: AuthMode) => void;
  children: ReactNode;
}

export function AuthShell({
  mode,
  direction,
  onModeChange,
  children,
}: AuthShellProps) {
  const { title, description } = copy[mode];

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: slideEase }}
        className="auth-card"
      >
        <Link href="/" className="auth-brand">
          pwnable.dyhs.kr
        </Link>

        <nav className="auth-tabs" aria-label="인증 메뉴">
          {tabs.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`auth-tab ${active ? "auth-tab-active" : ""}`}
                onClick={() => onModeChange(tab.id)}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="auth-tab-pill"
                    className="auth-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="auth-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="auth-header">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={mode}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: slideEase }}
            >
              <h1 className="auth-title">{title}</h1>
              <p className="auth-description">{description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          layout
          className="auth-form-panel"
          transition={{ layout: { duration: 0.38, ease: slideEase } }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={mode}
              custom={direction}
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.34, ease: slideEase }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="auth-footer">
          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "login" ? (
                <>
                  계정이 없으신가요?{" "}
                  <button
                    type="button"
                    className="auth-footer-link"
                    onClick={() => onModeChange("register")}
                  >
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{" "}
                  <button
                    type="button"
                    className="auth-footer-link"
                    onClick={() => onModeChange("login")}
                  >
                    로그인
                  </button>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
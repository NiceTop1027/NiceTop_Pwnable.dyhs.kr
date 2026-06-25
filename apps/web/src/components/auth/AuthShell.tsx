"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";
import {
  authEase,
  authSlideVariants,
  authTextVariants,
} from "@/components/auth/auth-motion";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

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

const heroCopy: Record<AuthMode, { eyebrow: string; headline: string; index: string }> = {
  login: {
    eyebrow: "Welcome back",
    headline: "이어서 학습하세요",
    index: "01",
  },
  register: {
    eyebrow: "Get started",
    headline: "포너블의 첫 걸음",
    index: "02",
  },
};

const highlights = ["체계적인 커리큘럼", "Docker 실습 워게임", "실시간 CTF · 랭킹"];

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
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const orbAY = useTransform(smoothProgress, [0, 1], [0, 140]);
  const orbBY = useTransform(smoothProgress, [0, 1], [0, -100]);
  const gridY = useTransform(smoothProgress, [0, 1], ["0%", "18%"]);
  const heroY = useTransform(smoothProgress, [0, 1], [0, -48]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.55, 1], [1, 0.92, 0.78]);
  const cardY = useTransform(smoothProgress, [0, 1], [0, 36]);
  const indexY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const indexOpacity = useTransform(smoothProgress, [0, 0.35, 0.75, 1], [0.11, 0.09, 0.05, 0.02]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const { title, description } = copy[mode];
  const hero = heroCopy[mode];

  return (
    <div
      ref={sceneRef}
      className={`auth-scene ${mode === "register" ? "auth-scene-tall" : "auth-scene-compact"}`}
    >
      <div className="auth-scene-glow" aria-hidden>
        <motion.span
          style={{ y: orbAY }}
          className="auth-scene-orb auth-scene-orb-a"
        />
        <motion.span
          style={{ y: orbBY }}
          className="auth-scene-orb auth-scene-orb-b"
        />
        <motion.span style={{ y: gridY }} className="auth-scene-gridlines" />
      </div>

      <AnimatePresence mode="wait">
        <motion.span
          key={hero.index}
          style={{ y: indexY, opacity: indexOpacity }}
          className="auth-scene-index"
          aria-hidden
          initial={{ scale: 0.92, filter: "blur(6px)" }}
          animate={{ scale: 1, filter: "blur(0px)" }}
          exit={{ scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: authEase }}
        >
          {hero.index}
        </motion.span>
      </AnimatePresence>

      <div className="auth-scene-inner">
        <motion.aside
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, x: -28, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: authEase }}
          className="auth-hero"
        >
          <Link href="/" className="auth-hero-brand">
            {SITE_NAME}
          </Link>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={mode}
              custom={direction}
              variants={authTextVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: authEase }}
              className="auth-hero-copy"
            >
              <p className="auth-hero-eyebrow">{hero.eyebrow}</p>
              <h2 className="auth-hero-title">{hero.headline}</h2>
              <p className="auth-hero-description">
                {SITE_DESCRIPTION}
              </p>
            </motion.div>
          </AnimatePresence>

          <ul className="auth-hero-list">
            {highlights.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ delay: 0.12 + i * 0.1, duration: 0.5, ease: authEase }}
              >
                <span className="auth-hero-dot" aria-hidden />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        <motion.div
          style={{ y: cardY }}
          initial={{ opacity: 0, y: 36, scale: 0.97, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: authEase, delay: 0.08 }}
          className="auth-card"
        >
          <Link href="/" className="auth-card-brand">
            {SITE_NAME}
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
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
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
                variants={authTextVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: authEase }}
              >
                <h1 className="auth-title">{title}</h1>
                <p className="auth-description">{description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            layout
            className="auth-form-panel"
            transition={{ layout: { duration: 0.4, ease: authEase } }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={mode}
                custom={direction}
                variants={authSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.36, ease: authEase }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="auth-footer">
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: authEase }}
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

      <div className="auth-scroll-progress" aria-hidden>
        <motion.span style={{ width: progressWidth }} className="auth-scroll-progress-fill" />
      </div>
    </div>
  );
}
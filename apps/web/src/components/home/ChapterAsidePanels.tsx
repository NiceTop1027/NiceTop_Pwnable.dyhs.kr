"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SyllabusItem = {
  index: string;
  title: string;
  status?: "done" | "active" | "next";
};

type TerminalLine = {
  kind: "prompt" | "out" | "ok" | "dim";
  text: string;
};

type ScoreRow = {
  rank: string;
  name: string;
  score: string;
  highlight?: boolean;
};

type ThreadRow = {
  kind: "q" | "a" | "dot";
  text: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function parseScore(value: string) {
  return Number(value.replace(/,/g, "")) || 0;
}

function formatScore(value: number) {
  return value.toLocaleString("en-US");
}

export function AnimatedSyllabus({
  items,
  live,
}: {
  items: SyllabusItem[];
  live: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, items.findIndex((item) => item.status === "active")),
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!live || reducedMotion) return;

    const stepMs = 45;
    const id = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) return value;
        return Math.min(100, value + 2.2);
      });
    }, stepMs);

    return () => window.clearInterval(id);
  }, [live, reducedMotion, activeIndex]);

  useEffect(() => {
    if (!live || reducedMotion) return;
    if (progress < 100) return;

    const id = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % items.length);
      setProgress(0);
    }, 700);

    return () => window.clearTimeout(id);
  }, [live, reducedMotion, progress, items.length]);

  const displayIndex = reducedMotion || !live
    ? Math.max(0, items.findIndex((item) => item.status === "active"))
    : activeIndex;

  return (
    <>
      <p className="chapter-aside-label">
        학습 경로
        {live && !reducedMotion && <span className="chapter-aside-live" aria-hidden />}
      </p>
      <ul className="chapter-syllabus">
        {items.map((item, index) => {
          const status =
            index < displayIndex
              ? "done"
              : index === displayIndex
                ? "active"
                : "next";

          return (
            <li
              key={item.index}
              className={`chapter-syllabus-item chapter-syllabus-item--${status}`}
            >
              <span className="chapter-syllabus-index">{item.index}</span>
              <div className="chapter-syllabus-body">
                <span className="chapter-syllabus-title">{item.title}</span>
                {status === "active" && live && !reducedMotion && (
                  <span className="chapter-syllabus-track" aria-hidden>
                    <motion.span
                      className="chapter-syllabus-fill"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.12, ease: "linear" }}
                    />
                  </span>
                )}
              </div>
              {status === "done" && (
                <span className="chapter-syllabus-check" aria-hidden>
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function AnimatedTerminal({
  lines,
  live,
}: {
  lines: TerminalLine[];
  live: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [finished, setFinished] = useState<TerminalLine[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!live || reducedMotion) {
      setFinished(lines);
      setLineIndex(lines.length);
      setCharIndex(0);
      return;
    }

    setFinished([]);
    setLineIndex(0);
    setCharIndex(0);
  }, [live, reducedMotion, lines]);

  useEffect(() => {
    if (!live || reducedMotion) return;

    const current = lines[lineIndex];
    if (!current) {
      const resetId = window.setTimeout(() => {
        setFinished([]);
        setLineIndex(0);
        setCharIndex(0);
      }, 1800);
      return () => window.clearTimeout(resetId);
    }

    if (charIndex < current.text.length) {
      const speed = current.kind === "dim" ? 14 : current.kind === "ok" ? 22 : 28;
      const id = window.setTimeout(() => setCharIndex((value) => value + 1), speed);
      return () => window.clearTimeout(id);
    }

    const pause = current.kind === "prompt" ? 520 : current.kind === "ok" ? 900 : 320;
    const id = window.setTimeout(() => {
      setFinished((prev) => [...prev, current]);
      setLineIndex((value) => value + 1);
      setCharIndex(0);
    }, pause);

    return () => window.clearTimeout(id);
  }, [live, reducedMotion, lines, lineIndex, charIndex]);

  const current = lines[lineIndex];
  const currentText = current ? current.text.slice(0, charIndex) : "";

  return (
    <div className="chapter-terminal">
      <div className="chapter-terminal-bar" aria-hidden>
        <span className="chapter-terminal-dot chapter-terminal-dot--red" />
        <span className="chapter-terminal-dot chapter-terminal-dot--yellow" />
        <span className="chapter-terminal-dot chapter-terminal-dot--green" />
        <span className="chapter-terminal-title">wargame@dyhs</span>
      </div>
      <div className="chapter-terminal-body">
        {finished.map((line, index) => (
          <p
            key={`${line.kind}-${index}`}
            className={`chapter-terminal-line chapter-terminal-line--${line.kind}`}
          >
            {line.text}
          </p>
        ))}
        {current && (
          <p className={`chapter-terminal-line chapter-terminal-line--${current.kind}`}>
            {currentText}
            {live && !reducedMotion && (
              <span className="chapter-terminal-cursor" aria-hidden>
                ▍
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

type LiveScoreRow = ScoreRow & { id: string; value: number };

export function AnimatedScoreboard({
  rows,
  live,
}: {
  rows: ScoreRow[];
  live: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const seedRows = useMemo<LiveScoreRow[]>(
    () =>
      rows.map((row) => ({
        ...row,
        id: row.name,
        value: parseScore(row.score),
      })),
    [rows],
  );
  const [board, setBoard] = useState(seedRows);

  useEffect(() => {
    setBoard(seedRows);
  }, [seedRows]);

  useEffect(() => {
    if (!live || reducedMotion) return;

    const tickId = window.setInterval(() => {
      setBoard((prev) =>
        [...prev]
          .map((row) => ({
            ...row,
            value: row.value + Math.floor(Math.random() * 36) + 8,
          }))
          .sort((a, b) => b.value - a.value)
          .map((row, index) => ({
            ...row,
            rank: String(index + 1),
            highlight: index === 0,
          })),
      );
    }, 2200);

    return () => window.clearInterval(tickId);
  }, [live, reducedMotion]);

  const displayRows = live && !reducedMotion ? board : seedRows;

  return (
    <>
      <p className="chapter-aside-label">
        Live Scoreboard
        {live && !reducedMotion && <span className="chapter-aside-live" aria-hidden />}
      </p>
      <div className="chapter-scoreboard">
        <div className="chapter-scoreboard-head">
          <span>Rank</span>
          <span>Team</span>
          <span>Score</span>
        </div>
        <AnimatePresence initial={false}>
          {displayRows.map((row) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0.6, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.4, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`chapter-scoreboard-row${row.highlight ? " chapter-scoreboard-row--active" : ""}`}
            >
              <span>{row.rank}</span>
              <span>{row.name}</span>
              <span>{formatScore(row.value)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export function AnimatedThreads({
  items,
  live,
}: {
  items: ThreadRow[];
  live: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? items.length : 1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!live || reducedMotion) {
      setVisibleCount(items.length);
      setTyping(false);
      return;
    }

    setVisibleCount(1);
    setTyping(false);
  }, [live, reducedMotion, items.length]);

  useEffect(() => {
    if (!live || reducedMotion) return;

    if (visibleCount >= items.length) {
      const id = window.setTimeout(() => {
        setVisibleCount(1);
        setTyping(false);
      }, 2600);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => setTyping(true), 1400);
    return () => window.clearTimeout(id);
  }, [live, reducedMotion, visibleCount, items.length]);

  useEffect(() => {
    if (!live || reducedMotion || !typing) return;

    const id = window.setTimeout(() => {
      setTyping(false);
      setVisibleCount((count) => count + 1);
    }, 900);

    return () => window.clearTimeout(id);
  }, [live, reducedMotion, typing]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <>
      <p className="chapter-aside-label">
        커뮤니티
        {live && !reducedMotion && <span className="chapter-aside-live" aria-hidden />}
      </p>
      <ul className="chapter-threads">
        <AnimatePresence initial={false}>
          {visibleItems.map((item, index) => (
            <motion.li
              key={`${item.kind}-${item.text}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`chapter-thread chapter-thread--${item.kind}`}
            >
              <span className="chapter-thread-mark">
                {item.kind === "q" ? "Q" : item.kind === "a" ? "A" : "·"}
              </span>
              <span className="chapter-thread-text">{item.text}</span>
              {live && !reducedMotion && index === visibleItems.length - 1 && (
                <span className="chapter-thread-new" aria-hidden>
                  new
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
        {typing && live && !reducedMotion && (
          <li className="chapter-thread chapter-thread--typing" aria-hidden>
            <span className="chapter-thread-mark">···</span>
            <span className="chapter-thread-typing-dots">
              <span />
              <span />
              <span />
            </span>
          </li>
        )}
      </ul>
    </>
  );
}
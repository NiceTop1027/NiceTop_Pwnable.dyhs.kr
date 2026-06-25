"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { getActCenterWeight, getActOpacity, getChapterGrandeur } from "@/lib/cinematic-scroll";
import {
  AnimatedScoreboard,
  AnimatedSyllabus,
  AnimatedTerminal,
  AnimatedThreads,
} from "@/components/home/ChapterAsidePanels";
import { useAsideLive } from "@/components/home/useAsideLive";

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

type ChapterAsideProps =
  | {
      variant: "syllabus";
      items: SyllabusItem[];
      actIndex: number;
      scrollYProgress: MotionValue<number>;
    }
  | {
      variant: "terminal";
      lines: TerminalLine[];
      actIndex: number;
      scrollYProgress: MotionValue<number>;
    }
  | {
      variant: "scoreboard";
      rows: ScoreRow[];
      actIndex: number;
      scrollYProgress: MotionValue<number>;
    }
  | {
      variant: "threads";
      items: ThreadRow[];
      actIndex: number;
      scrollYProgress: MotionValue<number>;
    };

function useAsideMotion(actIndex: number, scrollYProgress: MotionValue<number>) {
  const opacity = useTransform(scrollYProgress, (value) => {
    const visible = getActOpacity(value, actIndex);
    const grandeur = getChapterGrandeur(value, actIndex);
    return visible * Math.min(1, 0.25 + grandeur.weight * 0.75);
  });

  const y = useTransform(scrollYProgress, (value) => {
    const weight = getActCenterWeight(value, actIndex);
    return (1 - weight) * 36;
  });

  const scale = useTransform(scrollYProgress, (value) => {
    const weight = getActCenterWeight(value, actIndex);
    return 0.94 + weight * 0.06;
  });

  return { opacity, y, scale };
}

export function ChapterAside(props: ChapterAsideProps) {
  const { actIndex, scrollYProgress, variant } = props;
  const asideMotion = useAsideMotion(actIndex, scrollYProgress);
  const live = useAsideLive(actIndex, scrollYProgress);

  if (variant === "syllabus") {
    return (
      <motion.aside
        style={asideMotion}
        className="chapter-aside chapter-aside--syllabus"
        aria-hidden
      >
        <AnimatedSyllabus items={props.items} live={live} />
      </motion.aside>
    );
  }

  if (variant === "terminal") {
    return (
      <motion.aside
        style={asideMotion}
        className="chapter-aside chapter-aside--terminal"
        aria-hidden
      >
        <AnimatedTerminal lines={props.lines} live={live} />
      </motion.aside>
    );
  }

  if (variant === "scoreboard") {
    return (
      <motion.aside
        style={asideMotion}
        className="chapter-aside chapter-aside--scoreboard"
        aria-hidden
      >
        <AnimatedScoreboard rows={props.rows} live={live} />
      </motion.aside>
    );
  }

  return (
    <motion.aside
      style={asideMotion}
      className="chapter-aside chapter-aside--threads"
      aria-hidden
    >
      <AnimatedThreads items={props.items} live={live} />
    </motion.aside>
  );
}
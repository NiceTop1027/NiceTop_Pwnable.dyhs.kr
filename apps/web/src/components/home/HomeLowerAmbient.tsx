"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useHydrated } from "@/lib/use-hydrated";

export function HomeLowerAmbient() {
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.5"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.45]);

  return (
    <div ref={ref} className="home-lower-ambient-anchor h-px w-full" aria-hidden>
      <motion.div style={hydrated ? { opacity } : undefined} className="home-lower-ambient" />
    </div>
  );
}
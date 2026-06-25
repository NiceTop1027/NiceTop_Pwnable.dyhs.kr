"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { getActCenterWeight } from "@/lib/cinematic-scroll";

export function useAsideLive(
  actIndex: number,
  scrollYProgress: MotionValue<number>,
  threshold = 0.42,
) {
  const [live, setLive] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setLive(getActCenterWeight(value, actIndex) > threshold);
  });

  useEffect(() => {
    setLive(getActCenterWeight(scrollYProgress.get(), actIndex) > threshold);
  }, [actIndex, scrollYProgress, threshold]);

  return live;
}
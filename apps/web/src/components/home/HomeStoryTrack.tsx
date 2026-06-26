"use client";

import { motion, useMotionValue, useScroll, useSpring, type MotionValue } from "framer-motion";
import { createContext, useContext, useRef, type RefObject } from "react";
import { useHydrated } from "@/lib/use-hydrated";

const HomeStoryTrackContext = createContext<RefObject<HTMLDivElement | null> | null>(null);
const HomeStoryScrollContext = createContext<MotionValue<number> | null>(null);

export function useHomeStoryTrack() {
  return useContext(HomeStoryTrackContext);
}

export function useHomeStoryScroll() {
  return useContext(HomeStoryScrollContext);
}

export function HomeStoryTrack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const fallbackProgress = useMotionValue(0);
  const pull = useMotionValue(0);
  const pullSpring = useSpring(pull, {
    stiffness: 280,
    damping: 30,
  });
  const touchStartY = useRef<number | null>(null);
  const canPull = useRef(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const activeProgress = hydrated ? scrollYProgress : fallbackProgress;

  return (
    <HomeStoryTrackContext.Provider value={ref}>
      <HomeStoryScrollContext.Provider value={activeProgress}>
        <motion.div
          ref={ref}
          className="home-story-track"
          style={{ y: pullSpring }}
          onTouchStart={(event) => {
            if (typeof window === "undefined") return;
            canPull.current = window.scrollY <= 0;
            touchStartY.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(event) => {
            if (!canPull.current || touchStartY.current === null) return;
            const current = event.touches[0]?.clientY ?? 0;
            const delta = current - touchStartY.current;
            if (delta <= 0) {
              pull.set(0);
              return;
            }
            pull.set(Math.min(delta * 0.55, 96));
          }}
          onTouchEnd={() => {
            canPull.current = false;
            touchStartY.current = null;
            pull.set(0);
          }}
          onTouchCancel={() => {
            canPull.current = false;
            touchStartY.current = null;
            pull.set(0);
          }}
        >
          {children}
        </motion.div>
      </HomeStoryScrollContext.Provider>
    </HomeStoryTrackContext.Provider>
  );
}
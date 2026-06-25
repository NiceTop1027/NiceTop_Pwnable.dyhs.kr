"use client";

import { useMotionValue, useScroll, type MotionValue } from "framer-motion";
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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const activeProgress = hydrated ? scrollYProgress : fallbackProgress;

  return (
    <HomeStoryTrackContext.Provider value={ref}>
      <HomeStoryScrollContext.Provider value={activeProgress}>
        <div ref={ref} className="home-story-track">
          {children}
        </div>
      </HomeStoryScrollContext.Provider>
    </HomeStoryTrackContext.Provider>
  );
}
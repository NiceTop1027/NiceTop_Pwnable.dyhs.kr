"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type LectureProgressState } from "@/lib/api";

type LectureProgressContextValue = {
  progress: LectureProgressState;
  visitedPageSlugs: Set<string>;
  syncProgress: () => Promise<void>;
};

const LectureProgressContext =
  createContext<LectureProgressContextValue | null>(null);

export function useLectureProgress() {
  const value = useContext(LectureProgressContext);
  if (!value) {
    throw new Error("useLectureProgress must be used within LectureProgressProvider");
  }
  return value;
}

type LectureProgressProviderProps = {
  lectureSlug: string;
  pageSlug: string;
  totalPages: number;
  initialProgress: LectureProgressState | null;
  children: ReactNode;
};

function buildInitialState(
  pageSlug: string,
  totalPages: number,
  initial: LectureProgressState | null,
): LectureProgressState {
  if (initial) return initial;

  return {
    progress: totalPages <= 1 ? 0 : Math.round((1 / totalPages) * 100),
    completed: totalPages <= 1,
    visitedPageSlugs: [pageSlug],
    lastPageSlug: pageSlug,
  };
}

export function LectureProgressProvider({
  lectureSlug,
  pageSlug,
  totalPages,
  initialProgress,
  children,
}: LectureProgressProviderProps) {
  const [progress, setProgress] = useState<LectureProgressState>(() =>
    buildInitialState(pageSlug, totalPages, initialProgress),
  );

  const syncProgress = useCallback(async () => {
    const result = await api.recordLectureProgress(lectureSlug, pageSlug);
    setProgress({
      progress: result.progress,
      completed: result.completed,
      visitedPageSlugs: result.visitedPageSlugs,
      lastPageSlug: result.lastPageSlug,
    });
  }, [lectureSlug, pageSlug]);

  useEffect(() => {
    syncProgress().catch(() => {});
  }, [syncProgress]);

  const visitedPageSlugs = useMemo(
    () => new Set(progress.visitedPageSlugs),
    [progress.visitedPageSlugs],
  );

  const value = useMemo(
    () => ({ progress, visitedPageSlugs, syncProgress }),
    [progress, visitedPageSlugs, syncProgress],
  );

  return (
    <LectureProgressContext.Provider value={value}>
      {children}
    </LectureProgressContext.Provider>
  );
}
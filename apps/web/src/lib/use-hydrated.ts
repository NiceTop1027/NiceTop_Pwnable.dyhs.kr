"use client";

import { useEffect, useState } from "react";

/** SSR·첫 hydration과 클라이언트 상태 불일치 방지 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
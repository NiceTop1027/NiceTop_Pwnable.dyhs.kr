const inflight = new Map<string, Promise<unknown>>();

/** React Strict Mode에서 useEffect 이중 실행 시 API를 한 번만 호출합니다. */
export function createOnce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}
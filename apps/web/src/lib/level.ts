export function scoreToLevel(score: number): number {
  if (score <= 0) return 1;
  return Math.min(50, Math.floor(score / 200) + 1);
}
export const DIFFICULTY_XP_WEIGHT: Record<string, number> = {
  EASY: 1,
  MEDIUM: 1.5,
  HARD: 2,
  INSANE: 3,
};

export function calcChallengeXp(basePoints: number, difficulty: string): number {
  const weight = DIFFICULTY_XP_WEIGHT[difficulty] ?? 1;
  return Math.max(0, Math.round(basePoints * weight));
}
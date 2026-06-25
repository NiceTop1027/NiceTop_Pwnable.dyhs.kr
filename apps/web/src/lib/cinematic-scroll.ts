export const CINEMATIC_LAYOUT = {
  heroVh: 220,
  chapterVh: 280,
  chapterCount: 4,
  statementVh: 360,
} as const;

/** 챕터 전환 페이드 비율 — 낮을수록 한 장면에 머무는 시간이 길어짐 */
const ACT_FADE_RATIO = 0.085;

function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

/** 스토리 중반(CTF·커뮤니티)에서 웅장함 피크 */
export const GRANDEUR_PEAK = 0.58;

export function getCinematicTotalVh() {
  const { heroVh, chapterVh, chapterCount, statementVh } = CINEMATIC_LAYOUT;
  return heroVh + chapterVh * chapterCount + statementVh;
}

export function getActSegmentLengths() {
  const { heroVh, chapterVh, chapterCount, statementVh } = CINEMATIC_LAYOUT;
  return [heroVh, ...Array.from({ length: chapterCount }, () => chapterVh), statementVh];
}

export function getActBounds(actIndex: number) {
  const segments = getActSegmentLengths();
  const total = segments.reduce((sum, value) => sum + value, 0);
  let start = 0;

  for (let i = 0; i < actIndex; i += 1) {
    start += segments[i] / total;
  }

  const end = start + segments[actIndex] / total;
  return { start, end };
}

export function getActOpacity(progress: number, actIndex: number) {
  const { start, end } = getActBounds(actIndex);
  const span = end - start;
  if (span <= 0) return 0;

  const fade = span * ACT_FADE_RATIO;

  if (actIndex === 0 && progress <= start + fade) return 1;
  if (progress <= start) return 0;
  if (progress < start + fade) return smoothstep((progress - start) / fade);
  if (progress < end - fade) return 1;
  if (progress < end) return 1 - smoothstep((progress - (end - fade)) / fade);
  return 0;
}

export function getActScale(progress: number, actIndex: number) {
  const opacity = getActOpacity(progress, actIndex);
  if (opacity <= 0) return 0.96;

  const { start, end } = getActBounds(actIndex);
  const span = end - start;
  const fade = span * ACT_FADE_RATIO;

  if (actIndex === 0 && progress <= start + fade) return 1;
  const isChapter = actIndex >= 1 && actIndex <= 4;

  if (progress < start + fade) {
    const t = smoothstep((progress - start) / fade);
    return isChapter ? 0.84 + t * 0.16 : 0.9 + t * 0.1;
  }
  if (progress > end - fade) {
    const t = smoothstep((progress - (end - fade)) / fade);
    return isChapter ? 1 - t * 0.08 : 1 - t * 0.05;
  }
  return 1;
}

export function getActBlur(progress: number, actIndex: number) {
  const opacity = getActOpacity(progress, actIndex);
  if (opacity <= 0) return 0;

  const { start, end } = getActBounds(actIndex);
  const span = end - start;
  const fade = span * (ACT_FADE_RATIO + 0.01);

  if (actIndex === 0 && progress <= start + fade) return 0;
  if (progress < start + fade) {
    return 10 * (1 - smoothstep((progress - start) / fade));
  }
  if (progress > end - fade) {
    return 8 * smoothstep((progress - (end - fade)) / fade);
  }
  return 0;
}

/** 장면 진입·퇴장 시 수직 드리프트 */
export function getActTranslateY(progress: number, actIndex: number) {
  if (getActOpacity(progress, actIndex) <= 0) return 0;

  const { start, end } = getActBounds(actIndex);
  const span = end - start;
  const fade = span * ACT_FADE_RATIO;

  if (actIndex === 0 && progress <= start + fade) return 0;
  const drift = actIndex >= 1 && actIndex <= 4 ? 80 : 56;
  const exitDrift = actIndex >= 1 && actIndex <= 4 ? -56 : -40;

  if (progress < start + fade) {
    const t = smoothstep((progress - start) / fade);
    return drift * (1 - t);
  }
  if (progress > end - fade) {
    const t = smoothstep((progress - (end - fade)) / fade);
    return exitDrift * t;
  }
  return 0;
}

export function getActCenterWeight(progress: number, actIndex: number) {
  const { start, end } = getActBounds(actIndex);
  const center = start + (end - start) * 0.5;
  const radius = (end - start) * 0.5;
  if (radius <= 0) return 0;

  const distance = Math.abs(progress - center) / radius;
  return Math.max(0, 1 - distance);
}

function smootherstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type SculpturePose = {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  translateZ: number;
  coreRoundness: number;
  coreScaleX: number;
  coreScaleY: number;
  shellRoundness: number;
  ringScaleA: number;
  ringScaleB: number;
  ringScaleC: number;
  ringTiltA: number;
  ringTiltB: number;
  ringTiltC: number;
  ringRotateY: number;
  plateRoundnessFront: number;
  plateRoundnessBack: number;
  plateDepth: number;
  floorRotateX: number;
  nucleusScale: number;
  wireOpacity: number;
  specularX: number;
  specularY: number;
  contentTiltX: number;
  contentTiltY: number;
};

/** 챕터마다 다른 3D 포즈 — 스크롤 구간 사이에서 부드럽게 보간 */
const SCULPTURE_POSES: SculpturePose[] = [
  {
    rotateX: 10,
    rotateY: -22,
    rotateZ: -2,
    scale: 0.44,
    translateZ: -24,
    coreRoundness: 50,
    coreScaleX: 1,
    coreScaleY: 1,
    shellRoundness: 52,
    ringScaleA: 0.62,
    ringScaleB: 0.54,
    ringScaleC: 0.48,
    ringTiltA: 78,
    ringTiltB: 108,
    ringTiltC: 92,
    ringRotateY: 0,
    plateRoundnessFront: 24,
    plateRoundnessBack: 42,
    plateDepth: 16,
    floorRotateX: 88,
    nucleusScale: 0.32,
    wireOpacity: 0.12,
    specularX: 32,
    specularY: 28,
    contentTiltX: 0,
    contentTiltY: 0,
  },
  {
    rotateX: 16,
    rotateY: 6,
    rotateZ: -8,
    scale: 0.6,
    translateZ: 0,
    coreRoundness: 18,
    coreScaleX: 1.06,
    coreScaleY: 1,
    shellRoundness: 24,
    ringScaleA: 0.9,
    ringScaleB: 0.72,
    ringScaleC: 0.64,
    ringTiltA: 56,
    ringTiltB: 96,
    ringTiltC: 80,
    ringRotateY: 28,
    plateRoundnessFront: 6,
    plateRoundnessBack: 16,
    plateDepth: 40,
    floorRotateX: 76,
    nucleusScale: 0.48,
    wireOpacity: 0.26,
    specularX: 38,
    specularY: 22,
    contentTiltX: 0,
    contentTiltY: 0,
  },
  {
    rotateX: 30,
    rotateY: 48,
    rotateZ: 14,
    scale: 0.76,
    translateZ: 14,
    coreRoundness: 10,
    coreScaleX: 1.14,
    coreScaleY: 0.9,
    shellRoundness: 8,
    ringScaleA: 0.98,
    ringScaleB: 0.9,
    ringScaleC: 0.82,
    ringTiltA: 38,
    ringTiltB: 122,
    ringTiltC: 64,
    ringRotateY: 62,
    plateRoundnessFront: 2,
    plateRoundnessBack: 10,
    plateDepth: 56,
    floorRotateX: 66,
    nucleusScale: 0.4,
    wireOpacity: 0.36,
    specularX: 44,
    specularY: 18,
    contentTiltX: 0,
    contentTiltY: 0,
  },
  {
    rotateX: 20,
    rotateY: -16,
    rotateZ: -10,
    scale: 1,
    translateZ: 32,
    coreRoundness: 34,
    coreScaleX: 1,
    coreScaleY: 1.1,
    shellRoundness: 36,
    ringScaleA: 1.1,
    ringScaleB: 1.04,
    ringScaleC: 0.96,
    ringTiltA: 48,
    ringTiltB: 104,
    ringTiltC: 90,
    ringRotateY: -22,
    plateRoundnessFront: 30,
    plateRoundnessBack: 44,
    plateDepth: 78,
    floorRotateX: 60,
    nucleusScale: 0.58,
    wireOpacity: 0.4,
    specularX: 36,
    specularY: 30,
    contentTiltX: 0,
    contentTiltY: 0,
  },
  {
    rotateX: 12,
    rotateY: 32,
    rotateZ: 5,
    scale: 0.8,
    translateZ: 10,
    coreRoundness: 46,
    coreScaleX: 0.94,
    coreScaleY: 1,
    shellRoundness: 48,
    ringScaleA: 0.84,
    ringScaleB: 0.94,
    ringScaleC: 0.9,
    ringTiltA: 62,
    ringTiltB: 94,
    ringTiltC: 86,
    ringRotateY: 42,
    plateRoundnessFront: 34,
    plateRoundnessBack: 50,
    plateDepth: 46,
    floorRotateX: 72,
    nucleusScale: 0.5,
    wireOpacity: 0.22,
    specularX: 40,
    specularY: 34,
    contentTiltX: 0,
    contentTiltY: 0,
  },
  {
    rotateX: 5,
    rotateY: -10,
    rotateZ: 0,
    scale: 0.46,
    translateZ: -12,
    coreRoundness: 50,
    coreScaleX: 1.22,
    coreScaleY: 0.72,
    shellRoundness: 50,
    ringScaleA: 0.56,
    ringScaleB: 0.5,
    ringScaleC: 0.44,
    ringTiltA: 84,
    ringTiltB: 96,
    ringTiltC: 90,
    ringRotateY: 0,
    plateRoundnessFront: 48,
    plateRoundnessBack: 50,
    plateDepth: 20,
    floorRotateX: 86,
    nucleusScale: 0.28,
    wireOpacity: 0.1,
    specularX: 34,
    specularY: 36,
    contentTiltX: 0,
    contentTiltY: 0,
  },
];

function lerpPose(a: SculpturePose, b: SculpturePose, t: number): SculpturePose {
  const blend = smootherstep(t);
  const keys = Object.keys(a) as (keyof SculpturePose)[];
  const result = {} as SculpturePose;

  for (const key of keys) {
    result[key] = lerp(a[key], b[key], blend);
  }

  return result;
}

function getPoseCenters() {
  return SCULPTURE_POSES.map((_, index) => {
    const { start, end } = getActBounds(index);
    return start + (end - start) * 0.5;
  });
}

function sampleSculpturePose(progress: number): SculpturePose {
  const centers = getPoseCenters();
  const poses = SCULPTURE_POSES;

  if (progress <= centers[0]) return poses[0];
  if (progress >= centers[centers.length - 1]) return poses[poses.length - 1];

  for (let index = 0; index < centers.length - 1; index += 1) {
    const start = centers[index];
    const end = centers[index + 1];

    if (progress >= start && progress <= end) {
      return lerpPose(poses[index], poses[index + 1], (progress - start) / (end - start));
    }
  }

  return poses[poses.length - 1];
}

/**
 * 어둡게 시작 → 스크롤하며 상승 → 피크 후 다시 하강
 * 0: 암흑, ~0.58: 피크, 1: 잔잔한 어둠으로 복귀
 */
export function getGrandeurIntensity(progress: number) {
  if (progress <= 0) return 0;

  const peak = GRANDEUR_PEAK;

  if (progress < peak) {
    return smoothstep(progress / peak);
  }

  const fall = (progress - peak) / (1 - peak);
  return Math.max(0.06, 1 - smoothstep(fall) * 0.94);
}

/** 상승 구간에서만 순차 등장, 하강 구간에서는 arc와 함께 사라짐 */
export function getGrandeurLayer(progress: number, riseStart: number) {
  const intensity = getGrandeurIntensity(progress);

  if (progress >= GRANDEUR_PEAK) {
    return intensity;
  }

  if (progress < riseStart) return 0;

  const riseSpan = GRANDEUR_PEAK - riseStart;
  const riseAmount = smoothstep((progress - riseStart) / riseSpan);
  return riseAmount * intensity;
}

export type ChapterMood = "lecture" | "wargame" | "ctf" | "community";

const CHAPTER_ACT_INDICES: Record<ChapterMood, number> = {
  lecture: 1,
  wargame: 2,
  ctf: 3,
  community: 4,
};

/** 챕터 중심에서 피크 — 강의·워게임·CTF·커뮤니티 웅장함 */
export function getChapterGrandeur(progress: number, actIndex: number) {
  const visibility = getActOpacity(progress, actIndex);
  const weight = getActCenterWeight(progress, actIndex);
  const global = getGrandeurIntensity(progress);

  if (actIndex < 1 || actIndex > 4 || visibility <= 0) {
    return {
      opacity: 0,
      weight: 0,
      scale: 1,
      beam: 0,
      glow: 0,
      decor: 0,
      ringRotate: 0,
      ringRotateOuter: 0,
      corePulse: 0,
    };
  }

  const peak = visibility * Math.min(1, weight * 1.15);
  return {
    opacity: peak,
    weight,
    scale: 0.82 + weight * 0.28,
    beam: peak * (0.55 + global * 0.45),
    glow: peak * (0.7 + global * 0.3),
    decor: peak * weight,
    ringRotate: weight * 32,
    ringRotateOuter: -weight * 22,
    corePulse: 0.5 + weight * 0.5,
  };
}

export function getChapterGrandeurByMood(progress: number, mood: ChapterMood) {
  return getChapterGrandeur(progress, CHAPTER_ACT_INDICES[mood]);
}

export function getActHeadlineGlow(progress: number, actIndex: number) {
  const weight = getActCenterWeight(progress, actIndex);
  const grandeur = getChapterGrandeur(progress, actIndex);
  if (actIndex >= 1 && actIndex <= 4) {
    return weight * (0.35 + grandeur.glow * 0.65);
  }
  return weight * 0.2;
}

export function getMoodSceneStrength(progress: number, actIndex: number) {
  const actVisibility = getActOpacity(progress, actIndex);
  const grandeur = getGrandeurIntensity(progress);
  if (actVisibility <= 0) return 0;

  if (actIndex >= 1 && actIndex <= 4) {
    const chapter = getChapterGrandeur(progress, actIndex);
    return chapter.opacity * (0.55 + grandeur * 0.45);
  }

  if (actIndex === 0) {
    return actVisibility * (0.12 + grandeur * 0.18);
  }

  return actVisibility * (0.2 + grandeur * 0.35);
}

/** 스크롤 arc + 챕터 피크 조명 */
export function getStoryAtmosphere(progress: number) {
  const grandeur = getGrandeurIntensity(progress);
  const ctfPeak = getChapterGrandeur(progress, 3).glow;
  const boost = Math.max(grandeur, ctfPeak * 0.85);

  return {
    light: boost * 0.55,
    ring: boost * 0.72,
    ringScale: 0.68 + boost * 0.45,
    vignetteOpen: boost * 0.58,
  };
}

/** 스크롤에 따라 부드럽게 변형되는 3D 조형 파라미터 */
export function getSculptureMorph(progress: number) {
  const grandeur = getGrandeurIntensity(progress);
  const visibility = getGrandeurLayer(progress, 0.04);
  const pose = sampleSculpturePose(progress);
  const breathe = Math.sin(progress * Math.PI) * 0.04;
  const grandeurScale = 0.42 + grandeur * 0.58;

  return {
    visibility,
    rotateX: pose.rotateX + breathe * 8,
    rotateY: pose.rotateY + breathe * 4,
    rotateZ: pose.rotateZ,
    scale: pose.scale * grandeurScale,
    translateZ: pose.translateZ + grandeur * 8,
    coreRoundness: pose.coreRoundness,
    coreScaleX: pose.coreScaleX,
    coreScaleY: pose.coreScaleY,
    shellRoundness: pose.shellRoundness,
    ringScaleA: pose.ringScaleA,
    ringScaleB: pose.ringScaleB,
    ringScaleC: pose.ringScaleC,
    ringTiltA: pose.ringTiltA,
    ringTiltB: pose.ringTiltB,
    ringTiltC: pose.ringTiltC,
    ringRotateY: pose.ringRotateY,
    plateRoundnessFront: pose.plateRoundnessFront,
    plateRoundnessBack: pose.plateRoundnessBack,
    plateDepth: pose.plateDepth * (0.65 + grandeur * 0.35),
    floorRotateX: pose.floorRotateX,
    nucleusScale: pose.nucleusScale,
    wireOpacity: pose.wireOpacity * (0.5 + grandeur * 0.5),
    specularX: pose.specularX,
    specularY: pose.specularY,
    contentTiltX: pose.contentTiltX,
    contentTiltY: pose.contentTiltY,
  };
}
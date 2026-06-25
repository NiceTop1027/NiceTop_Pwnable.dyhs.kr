import { CINEMATIC_LAYOUT } from "@/lib/cinematic-scroll";

export const HOME_STORY_LAYOUT = {
  heroVh: CINEMATIC_LAYOUT.heroVh,
  chaptersVh: CINEMATIC_LAYOUT.chapterVh * CINEMATIC_LAYOUT.chapterCount,
  chapterCount: CINEMATIC_LAYOUT.chapterCount,
  statementVh: CINEMATIC_LAYOUT.statementVh,
} as const;

export type HomeStorySceneId =
  | "intro"
  | "lecture"
  | "wargame"
  | "ctf"
  | "community"
  | "statement"
  | "calm";

export type HomeStoryScene = {
  id: HomeStorySceneId;
  label: string;
  start: number;
  end: number;
};

export function getHomeStoryScenes(): HomeStoryScene[] {
  const { heroVh, chapterVh, chapterCount, statementVh } = CINEMATIC_LAYOUT;
  const total = heroVh + chapterVh * chapterCount + statementVh;
  const chapterSpan = chapterVh / total;

  let cursor = 0;
  const introEnd = heroVh / total;
  const scenes: HomeStoryScene[] = [
    { id: "intro", label: "시작", start: cursor, end: introEnd },
  ];
  cursor = introEnd;

  const chapterIds: HomeStorySceneId[] = ["lecture", "wargame", "ctf", "community"];
  const chapterLabels = ["강의", "워게임", "CTF", "커뮤니티"];

  chapterIds.forEach((id, index) => {
    scenes.push({
      id,
      label: chapterLabels[index],
      start: cursor + chapterSpan * index,
      end: cursor + chapterSpan * (index + 1),
    });
  });

  cursor += (chapterVh * chapterCount) / total;
  scenes.push({
    id: "statement",
    label: "올인원",
    start: cursor,
    end: 1,
  });

  return scenes;
}
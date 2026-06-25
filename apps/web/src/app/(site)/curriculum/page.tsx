import { api } from "@/lib/api";
import { mapCurriculaToTracks, type CurriculumTrack } from "@/lib/curriculum";
import CurriculumContent from "./CurriculumContent";

export const metadata = { title: "커리큘럼" };

export default async function CurriculumPage() {
  let tracks: CurriculumTrack[] = [];

  try {
    const curricula = await api.curricula();
    tracks = mapCurriculaToTracks(curricula);
  } catch {
    tracks = [];
  }

  return <CurriculumContent tracks={tracks} />;
}
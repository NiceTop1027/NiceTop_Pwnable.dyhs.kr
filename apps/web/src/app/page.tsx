import { HomeLowerAmbient } from "@/components/home/HomeLowerAmbient";
import { HomePageStory } from "@/components/home/HomePageStory";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CurriculumSection } from "@/components/home/CurriculumSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { CtaSection } from "@/components/home/CtaSection";
import { api } from "@/lib/api";
import { mapCurriculaToTracks, type CurriculumTrack } from "@/lib/curriculum";

export default async function HomePage() {
  let curriculumTracks: CurriculumTrack[] = [];

  try {
    curriculumTracks = mapCurriculaToTracks(await api.curricula());
  } catch {
    curriculumTracks = [];
  }

  return (
    <div className="home-page">
      <HomePageStory />
      <HomeLowerAmbient />
      <div className="home-page-content home-page-rest">
        <FeaturesSection />
        <CurriculumSection tracks={curriculumTracks} />
        <PartnersSection />
        <CtaSection />
      </div>
    </div>
  );
}
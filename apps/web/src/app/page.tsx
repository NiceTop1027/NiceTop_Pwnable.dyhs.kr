import { HeroSection } from "@/components/home/HeroSection";
import { ScrollStory } from "@/components/home/ScrollStory";
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
    <div className="bg-black">
      <HeroSection />
      <ScrollStory />
      <FeaturesSection />
      <CurriculumSection tracks={curriculumTracks} />
      <PartnersSection />
      <CtaSection />
    </div>
  );
}
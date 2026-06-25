"use client";

import { CinematicStory } from "@/components/home/CinematicStory";
import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomeStoryTrack } from "@/components/home/HomeStoryTrack";

export function HomePageStory() {
  return (
    <HomeStoryTrack>
      <HomeBackdrop />
      <div className="home-page-content">
        <CinematicStory />
      </div>
    </HomeStoryTrack>
  );
}
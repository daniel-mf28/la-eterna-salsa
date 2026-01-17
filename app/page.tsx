import { Nav } from "@/components/nav";
import { HeroSection } from "@/components/hero-section";
import { RecentSongsSection } from "@/components/recent-songs";
import { CommunitySection } from "@/components/community-section";
import { ShoutoutsCarousel } from "@/components/shoutouts-carousel";
import { DJTeamSection } from "@/components/dj-team";
import { SpotifyBentoSection } from "@/components/spotify-bento";
import { ListenPlatformsSection } from "@/components/listen-platforms";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Nav />
      <main className="flex-1">
        <HeroSection />
        <RecentSongsSection />
        <CommunitySection />
        <ShoutoutsCarousel />
        <DJTeamSection />
        <SpotifyBentoSection />
        <ListenPlatformsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

import { Nav } from "@/components/nav";
import { HeroSection } from "@/components/hero-section";
import { RecentSongsSection } from "@/components/recent-songs";
import { CommunitySection } from "@/components/community-section";
import { ShoutoutsCarousel } from "@/components/shoutouts-carousel";
import { BottomSection } from "@/components/bottom-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Nav />
      <main className="flex-1">
        <HeroSection />
        {/* Content sections — gap 24px matching design contentWrap */}
        <div className="flex flex-col items-center gap-4 md:gap-6 py-3 md:py-4">
          <RecentSongsSection />
          <CommunitySection />
          <ShoutoutsCarousel />
          <BottomSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

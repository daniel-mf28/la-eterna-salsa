"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { useNowPlaying } from "@/lib/now-playing-context";

export function Nav() {
  const [mounted, setMounted] = useState(false);
  const { currentSong, isLive } = useNowPlaying();

  useEffect(() => {
    setMounted(true);
  }, []);

  const playAndScroll = () => {
    const heroSection = document.querySelector("#hero-section");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
    // Trigger radio playback
    window.dispatchEvent(new CustomEvent("radio-play-request"));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="flex items-center justify-between px-6 md:px-12 py-5">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] italic font-bold text-[18px] leading-[0.9] text-[#C2491F] hover:opacity-80 transition-opacity whitespace-pre-line"
        >
          {"la\neterna\nsalsa"}
        </Link>

        {/* Now Playing + CTA */}
        <div className="flex items-center gap-4">
          {/* Now playing indicator */}
          {mounted && isLive && currentSong && (
            <button
              onClick={playAndScroll}
              className="hidden sm:flex items-center gap-2 text-[#0E1817] hover:text-[#C2491F] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2491F] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[160px]">
                {currentSong.title}
              </span>
            </button>
          )}

          {/* CTA */}
          <button
            onClick={playAndScroll}
            className="flex items-center gap-2 bg-[#C2491F] text-white text-[12px] sm:text-[13px] font-bold rounded-full px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-[#A33D1A] transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">ESCUCHAR EN VIVO</span>
            <span className="sm:hidden">EN VIVO</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

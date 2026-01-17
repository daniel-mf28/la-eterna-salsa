"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Radio, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNowPlaying } from "@/lib/now-playing-context";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/video", label: "Videos" },
  { href: "/programacion", label: "Programación" },
  { href: "/djs", label: "Nuestros DJs" },
  { href: "/contacto", label: "Contacto" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentSong, isLive } = useNowPlaying();

  const scrollToPlayer = () => {
    const heroSection = document.querySelector('#hero-section');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#D32F2F]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <Image
            src="/Logo.png"
            alt="La Eterna Salsa Logo"
            width={50}
            height={50}
            className="h-12 w-auto"
            priority
          />
          <span className="hidden sm:inline-block font-bold text-lg bg-gradient-to-r from-[#FBC000] to-[#D32F2F] bg-clip-text text-transparent">
            La Eterna Salsa
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-[#FBC000]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Now Playing & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Now Playing Section */}
          <button
            onClick={scrollToPlayer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D32F2F]/10 hover:bg-[#D32F2F]/20 border border-[#D32F2F]/30 transition-all group"
          >
            {/* Album Art or Live Indicator */}
            <div className="relative flex-shrink-0">
              {currentSong?.albumArt && currentSong.albumArt !== '/images/vinyl-placeholder.svg' ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#FBC000]/50 shadow-sm">
                  <Image
                    src={currentSong.albumArt}
                    alt="Now playing"
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                  {/* Spinning border animation when live */}
                  {isLive && (
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FBC000] animate-spin" style={{ animationDuration: '2s' }} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D32F2F]/20">
                  <Radio className="h-4 w-4 text-[#D32F2F] animate-pulse" />
                </div>
              )}
            </div>

            {/* Song Info - Hidden on mobile */}
            <div className="hidden sm:flex flex-col items-start max-w-[140px] lg:max-w-[180px]">
              {isLive && currentSong ? (
                <>
                  <span className="text-xs font-bold text-[#D32F2F] uppercase tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-pulse" />
                    En Vivo
                  </span>
                  <span className="text-xs text-foreground/80 truncate w-full">
                    {currentSong.title}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold text-[#D32F2F] uppercase tracking-wide">
                  EN VIVO
                </span>
              )}
            </div>

            {/* Play icon hint */}
            <Play className="h-3 w-3 text-[#FBC000] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
          </button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>

              {/* Now Playing in Mobile Menu */}
              {isLive && currentSong && (
                <div className="mt-4 p-3 bg-[#D32F2F]/10 rounded-lg border border-[#D32F2F]/30">
                  <div className="flex items-center gap-3">
                    {currentSong.albumArt && currentSong.albumArt !== '/images/vinyl-placeholder.svg' ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={currentSong.albumArt}
                          alt="Now playing"
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#D32F2F]/20 flex items-center justify-center flex-shrink-0">
                        <Radio className="h-6 w-6 text-[#D32F2F]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#D32F2F] uppercase">En Vivo</span>
                      <p className="text-sm font-medium truncate">{currentSong.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium py-2 transition-colors hover:text-[#FBC000]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

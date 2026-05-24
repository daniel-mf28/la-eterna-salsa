"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useNowPlaying } from "@/lib/now-playing-context";

type PlayerState = "stopped" | "loading" | "playing" | "error";

interface RadioPlayerProps {
  streamUrl?: string;
}

export function RadioPlayer({
  streamUrl = "https://example.com/stream",
}: RadioPlayerProps) {
  const [state, setState] = useState<PlayerState>("stopped");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentSong } = useNowPlaying();

  const hasAlbumArt =
    currentSong?.albumArt &&
    currentSong.albumArt !== "/images/vinyl-placeholder.svg";
  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "none";

      audioRef.current.addEventListener("canplay", () => setState("playing"));
      audioRef.current.addEventListener("playing", () => setState("playing"));
      audioRef.current.addEventListener("loadstart", () => setState("loading"));
      audioRef.current.addEventListener("waiting", () => setState("loading"));
      audioRef.current.addEventListener("error", () => setState("error"));
      audioRef.current.addEventListener("ended", () => setState("stopped"));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Listen for external play trigger (from nav CTA)
  useEffect(() => {
    const handlePlayRequest = () => {
      if (state === "stopped" || state === "error") {
        togglePlay();
      }
    };
    window.addEventListener("radio-play-request", handlePlayRequest);
    return () => window.removeEventListener("radio-play-request", handlePlayRequest);
  }, [state]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying || isLoading) {
        audioRef.current.pause();
        setState("stopped");
      } else {
        if (audioRef.current.src !== streamUrl) {
          audioRef.current.src = streamUrl;
        }
        setState("loading");
        await audioRef.current.play();
      }
    } catch {
      setState("error");
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  return (
    <div className="flex items-center gap-0 w-full h-auto md:h-[200px]">
      {/* Vinyl Record - Left side, smaller on mobile */}
      <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[200px] md:h-[200px] flex-shrink-0">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? "Pausar radio" : isLoading ? "Cargando" : "Reproducir radio en vivo"}
          className="absolute inset-0 z-10 rounded-[20px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2491F] group cursor-pointer disabled:cursor-wait"
        >
          {/* Vinyl disc */}
          <div
            className={`absolute inset-[5px] rounded-full bg-[#0A3538] ${isPlaying ? "animate-spin" : ""}`}
            style={{ animationDuration: "3s", animationTimingFunction: "linear" }}
          >
            {/* Grooves */}
            <div className="absolute inset-[8%] rounded-full border border-[#0A3538]/15" style={{ borderColor: "rgba(10,53,56,0.13)" }} />
            <div className="absolute inset-[14%] rounded-full border border-white/5" />
            <div className="absolute inset-[20%] rounded-full border border-[#0A3538]/13" style={{ borderColor: "rgba(10,53,56,0.13)" }} />

            {/* Center label - terracotta */}
            <div className="absolute inset-[32%] rounded-full overflow-hidden bg-[#C2491F]">
              {hasAlbumArt ? (
                <Image
                  src={currentSong!.albumArt!}
                  alt={`${currentSong!.title} album art`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority
                />
              ) : null}
            </div>

            {/* Spindle hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#0A3538]" />
            </div>
          </div>

          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            {isLoading ? (
              <Loader2 className="h-10 w-10 text-white animate-spin drop-shadow-lg" />
            ) : isPlaying ? (
              <Pause className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            ) : (
              <Play className="h-10 w-10 text-white ml-0.5 drop-shadow-lg" />
            )}
          </div>
        </button>
      </div>

      {/* Right Panel */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-3 sm:py-4">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#5B7368] uppercase tracking-[2px]">
            Sonando ahora
          </span>
          {isPlaying && (
            <span className="text-[9px] font-bold text-white bg-[#C2491F] px-2 py-0.5 rounded">
              EN VIVO
            </span>
          )}
        </div>

        {/* Song info */}
        <div>
          <p className="font-serif text-[18px] sm:text-[22px] md:text-[28px] text-[#0E1817] leading-tight truncate">
            {currentSong?.title || "La Eterna Salsa"}
          </p>
          <p className="text-[12px] sm:text-[14px] md:text-[16px] text-[#5B7368] truncate mt-0.5">
            {currentSong?.artist || "Radio en vivo"}
          </p>
        </div>

        {/* Progress bar (decorative) */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5B7368]">
            {isPlaying ? "••" : "00:00"}
          </span>
          <div className="flex-1 h-1 rounded-full bg-[#C7C0AF] overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#C2491F] transition-all duration-1000 ${isPlaying ? "w-1/3" : "w-0"}`}
            />
          </div>
          <span className="text-[10px] text-[#5B7368]">LIVE</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="hidden sm:block text-[#0A3538] hover:text-[#C2491F] transition-colors"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume1 className="h-[18px] w-[18px]" />}
          </button>

          <button className="text-[#0A3538] hover:text-[#C2491F] transition-colors" aria-label="Anterior">
            <SkipBack className="h-[22px] w-[22px]" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-11 h-11 rounded-full bg-[#0A3538] text-white flex items-center justify-center hover:bg-[#0A3538]/80 transition-colors disabled:cursor-wait"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          <button className="text-[#0A3538] hover:text-[#C2491F] transition-colors" aria-label="Siguiente">
            <SkipForward className="h-[22px] w-[22px]" />
          </button>

          <button
            className="hidden sm:block text-[#0A3538] hover:text-[#C2491F] transition-colors"
            aria-label="Volumen alto"
          >
            <Volume2 className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Error */}
        {state === "error" && (
          <p className="text-[11px] text-[#C2491F] font-medium">
            Error de conexión — toca para reconectar
          </p>
        )}
      </div>
    </div>
  );
}

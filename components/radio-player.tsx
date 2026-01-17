"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useNowPlaying } from "@/lib/now-playing-context";

type PlayerState = "stopped" | "loading" | "playing" | "error";

interface RadioPlayerProps {
  streamUrl?: string;
}

export function RadioPlayer({ streamUrl = "https://example.com/stream" }: RadioPlayerProps) {
  const [state, setState] = useState<PlayerState>("stopped");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentSong } = useNowPlaying();

  // Check if we have album art to display
  const hasAlbumArt = currentSong?.albumArt && currentSong.albumArt !== '/images/vinyl-placeholder.svg';

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "none";

      // Event handlers
      const handleCanPlay = () => {
        setState("playing");
      };

      const handlePlaying = () => {
        setState("playing");
      };

      const handleLoadStart = () => {
        setState("loading");
      };

      const handleWaiting = () => {
        setState("loading");
      };

      const handleError = () => {
        setState("error");
      };

      const handleEnded = () => {
        setState("stopped");
      };

      audioRef.current.addEventListener("canplay", handleCanPlay);
      audioRef.current.addEventListener("playing", handlePlaying);
      audioRef.current.addEventListener("loadstart", handleLoadStart);
      audioRef.current.addEventListener("waiting", handleWaiting);
      audioRef.current.addEventListener("error", handleError);
      audioRef.current.addEventListener("ended", handleEnded);
    }
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (state === "playing" || state === "loading") {
        audioRef.current.pause();
        setState("stopped");
      } else {
        if (audioRef.current.src !== streamUrl) {
          audioRef.current.src = streamUrl;
        }
        setState("loading");
        await audioRef.current.play();
        // Don't set state here - let event handlers do it
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setState("error");
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full space-y-6">
      {/* Vinyl Record Style Container */}
      <div className="relative h-52 md:h-64 flex items-center justify-center">
        {/* Outer vinyl ring with grooves */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`relative w-52 h-52 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl overflow-hidden ${state === "playing" ? "animate-spin" : ""}`}
            style={{ animationDuration: "4s" }}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-zinc-700/30" />
            <div className="absolute inset-4 rounded-full border border-zinc-700/20" />
            <div className="absolute inset-6 rounded-full border border-zinc-700/30" />
            <div className="absolute inset-8 rounded-full border border-zinc-700/20" />
            <div className="absolute inset-10 rounded-full border border-zinc-700/30" />

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          </div>
        </div>

        {/* Gold accent ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-[#FBC000]/30 ${state === "playing" ? "animate-spin" : ""}`}
            style={{ animationDuration: "8s" }}
          />
        </div>

        {/* Red accent ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-40 h-40 md:w-48 md:h-48 rounded-full border border-[#D32F2F]/40 ${state === "playing" ? "animate-spin" : ""}`}
            style={{ animationDuration: "6s", animationDirection: "reverse" }}
          />
        </div>

        {/* Center label area with album art */}
        <div className="flex justify-center relative z-10">
          <button
            onClick={togglePlay}
            disabled={state === "loading"}
            className={`
              relative w-32 h-32 md:w-40 md:h-40 rounded-full
              overflow-hidden
              shadow-[0_0_40px_rgba(211,47,47,0.4),0_0_80px_rgba(251,192,0,0.2)]
              hover:shadow-[0_0_60px_rgba(211,47,47,0.6),0_0_100px_rgba(251,192,0,0.3)]
              hover:scale-105 active:scale-95
              transition-all duration-300 ease-out
              disabled:opacity-70 disabled:cursor-not-allowed
              ${state === "playing" ? "animate-spin" : ""}
            `}
            style={{ animationDuration: "4s" }}
          >
            {/* Album art or gradient background */}
            {hasAlbumArt ? (
              <Image
                src={currentSong!.albumArt!}
                alt="Album art"
                fill
                className="object-cover"
                sizes="160px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#D32F2F] via-[#ff8906] to-[#FBC000]" />
            )}

            {/* Center hole and play/pause overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Dark center hole */}
              <div className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border-2 border-[#FBC000]/50" />

              {/* Play/Pause icon overlay */}
              <div
                className={`
                  absolute inset-0 flex items-center justify-center
                  bg-black/40 opacity-0 hover:opacity-100 transition-opacity
                  ${state === "playing" ? "" : "opacity-100 bg-transparent"}
                `}
                style={state === "playing" ? { animation: 'none' } : {}}
              >
                {state === "loading" ? (
                  <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-white animate-spin" />
                ) : state === "playing" ? (
                  <Pause className="h-12 w-12 md:h-16 md:w-16 text-white drop-shadow-lg" />
                ) : (
                  <Play className="h-12 w-12 md:h-16 md:w-16 text-white ml-1 drop-shadow-lg" />
                )}
              </div>
            </div>

            {/* Circular border for label area */}
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800/50" />
          </button>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-1">
        {state === "playing" ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#D32F2F] animate-pulse shadow-[0_0_10px_rgba(211,47,47,0.8)]" />
            <span className="text-lg font-bold text-[#D32F2F] tracking-wide">EN VIVO</span>
          </div>
        ) : state === "loading" ? (
          <span className="text-lg font-medium text-[#FBC000]">Conectando...</span>
        ) : state === "error" ? (
          <span className="text-lg font-medium text-destructive">Error - Toca para reconectar</span>
        ) : (
          <span className="text-lg font-medium text-[#FBC000]">Toca para escuchar</span>
        )}

        {/* Show current song info below status */}
        {currentSong && (
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground/90">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
          </div>
        )}
      </div>

      {/* Volume Controls - Sleek design */}
      <div className="flex items-center justify-center space-x-4 pt-2">
        <button
          onClick={toggleMute}
          className="h-10 w-10 rounded-full bg-[#1a1820] border border-[#FBC000]/20 flex items-center justify-center hover:bg-[#FBC000]/10 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-[#FBC000]" />
          ) : (
            <Volume2 className="h-5 w-5 text-[#FBC000]" />
          )}
        </button>
        <div className="flex items-center space-x-3 flex-1 max-w-xs">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-[#1a1820] rounded-full appearance-none cursor-pointer accent-[#FBC000]"
            style={{
              background: `linear-gradient(to right, #FBC000 0%, #FBC000 ${(isMuted ? 0 : volume) * 100}%, #1a1820 ${(isMuted ? 0 : volume) * 100}%, #1a1820 100%)`
            }}
          />
          <span className="text-sm font-bold w-12 text-right text-[#FBC000]">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

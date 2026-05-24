"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";

type PlayerState = "stopped" | "loading" | "playing" | "error";

interface RadioContextValue {
  state: PlayerState;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({
  streamUrl = "https://example.com/stream",
  children,
}: {
  streamUrl?: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<PlayerState>("stopped");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  // Create single audio element
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

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (state === "playing" || state === "loading") {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
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
  }, [state, streamUrl]);

  // Listen for external play trigger (from nav CTA)
  useEffect(() => {
    const handlePlayRequest = () => {
      if (state === "stopped" || state === "error") {
        togglePlay();
      }
    };
    window.addEventListener("radio-play-request", handlePlayRequest);
    return () => window.removeEventListener("radio-play-request", handlePlayRequest);
  }, [state, togglePlay]);

  return (
    <RadioContext.Provider
      value={{ state, volume, isMuted, isPlaying, isLoading, togglePlay, setVolume, setIsMuted }}
    >
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used within RadioProvider");
  return ctx;
}

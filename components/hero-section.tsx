"use client";

import { useEffect, useState } from "react";
import { RadioPlayer } from "./radio-player";
import { ChatWidget } from "./chat-widget";
import { createClient } from "@/lib/supabase";

export function HeroSection() {
  const [streamUrl, setStreamUrl] = useState<string>("https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream");
  const supabase = createClient();

  useEffect(() => {
    // Fetch stream URL from site_config
    const fetchStreamUrl = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'stream_url')
        .single();

      if (!error && data && (data as any)?.value) {
        setStreamUrl((data as any).value);
      }
    };

    fetchStreamUrl();
  }, []);

  return (
    <section id="hero-section" className="py-16 md:py-24 relative overflow-hidden">
      {/* Warm gradient background */}
      <div
        className="absolute -inset-x-0 -top-20 bottom-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 50%, rgba(211, 47, 47, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(251, 192, 0, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(255, 137, 6, 0.12) 0%, transparent 40%)
          `,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-[#FBC000]/40 animate-pulse" />
      <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-[#D32F2F]/30 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full bg-[#FBC000]/30 animate-pulse" style={{ animationDelay: "0.5s" }} />

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Side - Radio Player */}
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Radio Salsa{" "}
              <span className="bg-gradient-to-r from-[#FBC000] via-[#ff8906] to-[#D32F2F] bg-clip-text text-transparent">
                en Vivo
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-[#FBC000]/90 italic">
              El Sonido de las Palmeras
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Escucha salsa clásica, brava y vieja guardia gratis las 24 horas. Desde Colombia para todo LATAM.
            </p>
          </div>

          {/* Radio Player - Centered and prominent */}
          <div className="pt-4">
            <RadioPlayer streamUrl={streamUrl} />
          </div>
        </div>

        {/* Right Side - Chat */}
        <div className="w-full lg:pl-8">
          <ChatWidget />
        </div>
      </div>
    </section>
  );
}


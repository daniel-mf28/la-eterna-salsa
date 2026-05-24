"use client";

import { useEffect, useState } from "react";
import { RadioPlayer } from "./radio-player";
import { ChatWidget } from "./chat-widget";
import { createClient } from "@/lib/supabase";

export function HeroSection() {
  const [streamUrl, setStreamUrl] = useState<string>(
    "https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream"
  );
  const supabase = createClient();

  useEffect(() => {
    const fetchStreamUrl = async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "stream_url")
        .single();

      if (!error && data && (data as any)?.value) {
        setStreamUrl((data as any).value);
      }
    };

    fetchStreamUrl();
  }, []);

  return (
    <section id="hero-section" className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        aria-hidden="true"
      />

      {/* ===== DESKTOP (lg+) — pixel-perfect 1440px layout ===== */}
      <div className="hidden lg:block relative z-10 mx-auto w-full max-w-[1440px] h-[758px]">

        {/* Title group — positioned exactly as design: x:335 y:77 w:502 h:391 */}
        <div
          className="absolute pointer-events-none"
          style={{ left: 335, top: 77, width: 502, height: 391 }}
        >
          {/* "la" — x:157 y:39 within group */}
          <span
            className="absolute font-serif text-[#C2491F]"
            style={{
              left: 157,
              top: 39,
              fontSize: 88,
              lineHeight: 0.78,
              letterSpacing: -3.6,
              fontWeight: "normal",
            }}
          >
            la
          </span>

          {/* "eterna\nsalsa" — x:-12 y:86 w:528, center-aligned */}
          <span
            className="absolute font-serif text-[#C2491F] text-center whitespace-pre-line"
            style={{
              left: -12,
              top: 86,
              width: 528,
              fontSize: 160,
              lineHeight: 0.78,
              letterSpacing: -6.1,
              fontWeight: "normal",
            }}
          >
            {"eterna\nsalsa"}
          </span>

          {/* "RADIO ONLINE" — x:132 y:339 */}
          <span
            className="absolute font-sans text-[#0A3538]"
            style={{
              left: 132,
              top: 339,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 8,
            }}
          >
            RADIO ONLINE
          </span>
        </div>

        {/* Player — x:191 y:477 w:610 h:200 */}
        <div
          className="absolute z-20"
          style={{ left: 191, top: 477, width: 610, height: 200 }}
        >
          <div
            className="w-full h-full rounded-[20px] overflow-hidden"
            style={{
              background: "#FBF1E4F0",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 6px 24px rgba(10, 53, 56, 0.19)",
            }}
          >
            <RadioPlayer streamUrl={streamUrl} />
          </div>
        </div>

        {/* Chat — x:1066 y:204 w:332 h:524 */}
        <div
          className="absolute z-20"
          style={{ left: 1066, top: 204, width: 332, height: 524 }}
        >
          <div
            className="w-full h-full rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "#FBF1E4F0",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 6px 24px rgba(10, 53, 56, 0.19)",
            }}
          >
            <ChatWidget />
          </div>
        </div>
      </div>

      {/* ===== TABLET (md) ===== */}
      <div className="hidden md:block lg:hidden relative z-10 mx-auto w-full h-[600px]">
        {/* Title centered */}
        <div className="absolute inset-x-0 top-16 flex justify-center pointer-events-none">
          <div className="relative" style={{ width: 400 }}>
            <span
              className="absolute font-serif text-[#C2491F]"
              style={{ left: 120, top: 30, fontSize: 68, lineHeight: 0.78, letterSpacing: -2.8 }}
            >
              la
            </span>
            <span
              className="absolute font-serif text-[#C2491F] text-center whitespace-pre-line"
              style={{ left: -10, top: 70, width: 420, fontSize: 120, lineHeight: 0.78, letterSpacing: -4.5 }}
            >
              {"eterna\nsalsa"}
            </span>
            <span
              className="absolute font-sans text-[#0A3538]"
              style={{ left: 95, top: 275, fontSize: 18, fontWeight: 700, letterSpacing: 6 }}
            >
              RADIO ONLINE
            </span>
          </div>
        </div>

        {/* Player bottom */}
        <div className="absolute left-8 right-8 bottom-8 z-20">
          <div
            className="w-full max-w-[610px] h-[200px] rounded-[20px] overflow-hidden"
            style={{
              background: "#FBF1E4F0",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 6px 24px rgba(10, 53, 56, 0.19)",
            }}
          >
            <RadioPlayer streamUrl={streamUrl} />
          </div>
        </div>
      </div>

      {/* ===== MOBILE (< md) ===== */}
      <div className="block md:hidden relative z-10 w-full h-[480px]">
        {/* Title scaled down — top padding for nav */}
        <div className="absolute inset-x-0 top-20 flex justify-center pointer-events-none">
          <div className="text-center px-4">
            <span className="block font-serif text-[#C2491F]" style={{ fontSize: 40, lineHeight: 0.78, letterSpacing: -1.5 }}>
              la
            </span>
            <span className="block font-serif text-[#C2491F] whitespace-pre-line" style={{ fontSize: 56, lineHeight: 0.82, letterSpacing: -2, marginTop: 4 }}>
              {"eterna\nsalsa"}
            </span>
            <span className="block font-sans text-[#0A3538] mt-2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3 }}>
              RADIO ONLINE
            </span>
          </div>
        </div>

        {/* Player bottom — taller for mobile layout */}
        <div className="absolute left-3 right-3 bottom-3 z-20">
          <div
            className="w-full rounded-[16px] overflow-hidden"
            style={{
              background: "#FBF1E4F0",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 6px 24px rgba(10, 53, 56, 0.19)",
            }}
          >
            <RadioPlayer streamUrl={streamUrl} />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Chat — below hero */}
      <div className="lg:hidden relative z-20 px-4 py-4">
        <div
          className="w-full h-[420px] rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: "#FBF1E4F0",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 6px 24px rgba(10, 53, 56, 0.19)",
          }}
        >
          <ChatWidget />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type ShoutoutRow = Database["public"]["Tables"]["shoutouts"]["Row"];

interface Shoutout {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  message: string;
  songRequest?: string | null;
  approved: boolean;
  createdAt: string;
}

const FALLBACK_SHOUTOUTS: Shoutout[] = [
  {
    id: "fallback-1",
    name: "Carlos Rodriguez",
    city: "Cali",
    country: "Colombia",
    message: "Un saludo a toda mi familia en Buenaventura! Que viva la salsa!",
    songRequest: "El Cantante - Héctor Lavoe",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    name: "Maria Gonzalez",
    city: "Medellín",
    country: "Colombia",
    message: "Dedicado a mi esposo en su cumpleaños. Te amo mi amor!",
    songRequest: "Llorarás - Oscar D'León",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    name: "Roberto Martinez",
    city: "Miami",
    country: "Estados Unidos",
    message: "Saludos desde Miami! La mejor música para recordar nuestra tierra",
    songRequest: "Aguanile - Willie Colón",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    name: "Ana Lucia Perez",
    city: "Bogotá",
    country: "Colombia",
    message: "Para mis amigas del grupo de baile. Las quiero mucho!",
    approved: true,
    createdAt: new Date().toISOString(),
  },
];

function mapShoutoutToDisplay(shoutout: ShoutoutRow): Shoutout {
  return {
    id: shoutout.id,
    name: shoutout.name,
    city: shoutout.city,
    country: shoutout.country,
    message: shoutout.message,
    songRequest: shoutout.song_request,
    approved: shoutout.approved,
    createdAt: shoutout.created_at,
  };
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(formatTimeAgo(dateStr));
    const interval = setInterval(() => setText(formatTimeAgo(dateStr)), 60000);
    return () => clearInterval(interval);
  }, [dateStr]);

  return (
    <span className="font-sans text-xs text-[#5B7368]/60 flex-shrink-0 mt-1">
      {text}
    </span>
  );
}

export function ShoutoutsCarousel() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>(FALLBACK_SHOUTOUTS);
  const [isLoading, setIsLoading] = useState(true);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formSong, setFormSong] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchApprovedShoutouts = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("shoutouts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setShoutouts(data.map(mapShoutoutToDisplay));
        }
      } catch {
        // Keep fallback shoutouts
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedShoutouts();

    const supabase = createClient();
    const channel = supabase
      .channel("all_shoutouts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shoutouts",
        },
        () => fetchApprovedShoutouts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("shoutouts").insert({
        name: formName.trim(),
        city: formLocation.trim() || null,
        country: null,
        message: formMessage.trim(),
        song_request: formSong.trim() || null,
        approved: true,
      } as never);

      if (!error) {
        setFormName("");
        setFormLocation("");
        setFormMessage("");
        setFormSong("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch {
      // Silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((isLoading && shoutouts.length === 0) || shoutouts.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 md:px-6">
      <div className="max-w-[1398px] mx-auto">
        <div
          className="rounded-2xl md:rounded-3xl p-5 md:px-12 md:py-10"
          style={{
            background: "#FBF1E4",
            boxShadow: "0 4px 20px rgba(10, 53, 56, 0.15)",
          }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Left: Shoutouts List */}
            <div className="flex-1 min-w-0">
              <h3 className="font-sans text-[14px] font-extrabold tracking-wider text-[#C2491F] uppercase mb-5">
                Saludos y Dedicatorias
              </h3>

              <div className="space-y-0">
                {shoutouts.slice(0, 4).map((shoutout, index) => (
                  <div
                    key={`${shoutout.id}-${index}`}
                    className={`flex items-start gap-3 pb-3 pt-3 first:pt-0 ${
                      index < 3 ? "border-b border-[#C7C0AF]/40" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-[36px] h-[36px] rounded-full bg-[#FAD09F] flex-shrink-0 flex items-center justify-center">
                      <span className="text-[#0A3538] text-[12px] font-bold">
                        {shoutout.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="font-sans text-[13px] font-bold text-[#0A3538]">
                          {shoutout.name}
                        </span>
                        {shoutout.city && (
                          <span className="font-sans text-[12px] text-[#5B7368]">
                            desde {shoutout.city}
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-[#5B7368] mt-0.5 line-clamp-1">
                        {shoutout.message}
                      </p>
                    </div>

                    {/* Timestamp — client-only to avoid hydration mismatch */}
                    <TimeAgo dateStr={shoutout.createdAt} />
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-[#C7C0AF]/30 self-stretch" />
            <div className="block md:hidden h-px bg-[#C7C0AF]/30 my-6" />

            {/* Right: Submission Form */}
            <div className="flex-1 min-w-0">
              <h3 className="font-sans text-[14px] font-extrabold tracking-wider text-[#0E1817] uppercase mb-5">
                Deja Tu Saludo o Dedicatoria
              </h3>

              {submitSuccess ? (
                <div className="flex items-center justify-center h-48">
                  <p className="font-sans text-sm text-[#5B7368] text-center">
                    Tu saludo fue enviado y será publicado pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="flex-1 h-12 px-3 rounded-md border border-[#C7C0AF] bg-white font-sans text-[14px] text-[#0A3538] placeholder:text-[#5B7368]/50 focus:outline-none focus:ring-2 focus:ring-[#C2491F]/30"
                    />
                    <input
                      type="text"
                      placeholder="¿Desde dónde nos escuchas?"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="flex-1 h-12 px-3 rounded-md border border-[#C7C0AF] bg-white font-sans text-[14px] text-[#0A3538] placeholder:text-[#5B7368]/50 focus:outline-none focus:ring-2 focus:ring-[#C2491F]/30"
                    />
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Tu saludo o dedicatoria (máx. 160 caracteres)"
                      value={formMessage}
                      onChange={(e) =>
                        setFormMessage(e.target.value.slice(0, 160))
                      }
                      required
                      className="w-full h-[120px] px-3 py-3 rounded-md border border-[#C7C0AF] bg-white font-sans text-[14px] text-[#0A3538] placeholder:text-[#5B7368]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[#C2491F]/30"
                    />
                    <span className="absolute bottom-2 right-3 font-sans text-xs text-[#5B7368]/60">
                      {formMessage.length}/160
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="🎵 Canción que te gustaría escuchar (opcional)"
                    value={formSong}
                    onChange={(e) => setFormSong(e.target.value)}
                    maxLength={200}
                    className="w-full h-12 px-3 rounded-md border border-[#C7C0AF] bg-white font-sans text-[14px] text-[#0A3538] placeholder:text-[#5B7368]/50 focus:outline-none focus:ring-2 focus:ring-[#C2491F]/30"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-[#C2491F] text-white font-sans text-[14px] font-bold tracking-wider uppercase hover:bg-[#C2491F]/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Saludo"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

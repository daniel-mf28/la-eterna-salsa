"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Music } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { useDragScroll } from "@/lib/use-drag-scroll";

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

// Fallback shoutouts when database is empty or not configured
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

export function ShoutoutsCarousel() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>(FALLBACK_SHOUTOUTS);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    const fetchApprovedShoutouts = async () => {
      try {
        const supabase = createClient();

        // Fetch approved shoutouts, ordered by creation date (newest first)
        const { data, error } = await supabase
          .from("shoutouts")
          .select("*")
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching shoutouts:", error);
          // Keep fallback shoutouts on error
          setIsLoading(false);
          return;
        }

        // If we have data, use it; otherwise keep fallback
        if (data && data.length > 0) {
          setShoutouts(data.map(mapShoutoutToDisplay));
        }
      } catch (error) {
        console.error("Error in fetchApprovedShoutouts:", error);
        // Keep fallback shoutouts on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedShoutouts();

    // Subscribe to real-time updates for approved shoutouts
    const supabase = createClient();
    const channel = supabase
      .channel("approved_shoutouts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shoutouts",
          filter: "approved=eq.true",
        },
        () => {
          // Refetch when changes occur
          fetchApprovedShoutouts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Don't render if still loading and no fallback data
  if (isLoading && shoutouts.length === 0) {
    return null;
  }

  // Don't render section if no shoutouts at all
  if (shoutouts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-card/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Saludos y Dedicatorias
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comparte tu mensaje con la comunidad salsera
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="relative overflow-x-auto mb-8 pb-4 hide-scrollbar"
        >
          <div className="flex gap-6 w-max">
            {shoutouts.map((shoutout, index) => (
              <Card
                key={`${shoutout.id}-${index}`}
                className="flex-shrink-0 w-[350px] bg-card/50 backdrop-blur border-border/50 hover:border-brand-orange/50 transition-all duration-300"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header with name and location */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-brand-orange">
                        {shoutout.name}
                      </h3>
                      {(shoutout.city || shoutout.country) && (
                        <p className="text-sm text-muted-foreground">
                          {[shoutout.city, shoutout.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <Heart className="h-5 w-5 text-brand-coral fill-brand-coral" />
                  </div>

                  {/* Message */}
                  <p className="text-foreground leading-relaxed line-clamp-4">
                    {shoutout.message}
                  </p>

                  {/* Song Request */}
                  {shoutout.songRequest && (
                    <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                      <Music className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground italic">
                        {shoutout.songRequest}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/shoutout">
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white text-lg px-8 py-6 h-auto"
            >
              Deja Tu Saludo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

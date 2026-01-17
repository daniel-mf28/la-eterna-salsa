"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

export default function VideoPage() {
  const [playlistId, setPlaylistId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylistId();
  }, []);

  const loadPlaylistId = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "youtube_playlist_id")
      .single();

    if (!error && data) {
      setPlaylistId(data.value);
    }
    setLoading(false);
  };

  const embedUrl = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&modestbranding=1&rel=0&showinfo=0`
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#D32F2F]/20 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-[#FBC000]" />
            <span className="font-semibold">Volver al Inicio</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-[#D32F2F] animate-pulse" />
            <span className="text-sm font-bold tracking-wide text-[#D32F2F]">
              EN VIVO
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Video Section */}
        <section className="flex-1 bg-black">
          <div className="container h-full py-4 md:py-8">
            <div className="h-full flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-[#FBC000] to-[#D32F2F] bg-clip-text text-transparent">
                La Eterna Salsa - En Vivo
              </h1>

              {/* YouTube Embed */}
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white">Cargando playlist...</p>
                </div>
              ) : !playlistId ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white">No hay playlist configurada</p>
                </div>
              ) : (
                <div className="flex-1 relative rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="La Eterna Salsa - Video en Vivo"
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Disfruta de nuestra selección de videos de salsa clásica
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="border-t border-[#D32F2F]/20 bg-card/50 py-6">
          <div className="container">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">
                ¿Prefieres solo el audio?
              </h2>
              <Link href="/">
                <Button
                  className="bg-gradient-to-r from-[#D32F2F] to-[#FBC000] hover:opacity-90 transition-opacity text-white font-bold shadow-lg"
                >
                  Ir al Reproductor de Radio
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D32F2F]/20 py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} La Eterna Salsa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

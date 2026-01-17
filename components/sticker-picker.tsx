"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Sticker {
  id: string;
  name: string;
  image_url: string;
}

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

export function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStickers() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("stickers")
          .select("*")
          .order("created_at", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setStickers(data || []);
      } catch (err) {
        console.error("Error fetching stickers:", err);
        setError("No se pudieron cargar los stickers");
      } finally {
        setLoading(false);
      }
    }

    fetchStickers();
  }, []);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Stickers</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && stickers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No hay stickers disponibles todavía
            </p>
          </div>
        )}

        {!loading && !error && stickers.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 pb-4">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onSelect(sticker.image_url)}
                className="relative overflow-hidden rounded-lg hover:bg-accent p-3 transition-all aspect-square flex items-center justify-center"
                title={sticker.name}
              >
                <img
                  src={sticker.image_url}
                  alt={sticker.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {!loading && !error && stickers.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Más stickers próximamente
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search } from "lucide-react";

interface GiphyGif {
  id: string;
  images: {
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
  };
  title: string;
}

interface GiphyPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export function GiphyPicker({ onSelect, onClose }: GiphyPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "demo";

  // Load trending GIFs on mount
  useEffect(() => {
    loadTrendingGifs();
  }, []);

  const loadTrendingGifs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Error loading trending GIFs:", error);
      setGifs([]);
    }
    setIsLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadTrendingGifs();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Error searching GIFs:", error);
      setGifs([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Buscar GIFs</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar GIFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-12 text-base"
          />
          <Button
            type="submit"
            size="lg"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {/* GIF Grid */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">
              No se encontraron GIFs. Intenta otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-4">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.images.fixed_width.url)}
                className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-brand-orange transition-all bg-muted aspect-square"
              >
                <img
                  src={gif.images.fixed_width.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">Powered by GIPHY</p>
      </div>
    </div>
  );
}

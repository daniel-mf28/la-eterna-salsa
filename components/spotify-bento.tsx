"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function SpotifyBentoSection() {
    const [playlistIds, setPlaylistIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPlaylistIds()
    }, [])

    const loadPlaylistIds = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'spotify_playlist_ids')
            .single()

        if (!error && data && (data as any)?.value) {
            try {
                // Try parsing as JSON array first
                const parsed = JSON.parse((data as any).value)
                setPlaylistIds(Array.isArray(parsed) ? parsed : [])
            } catch {
                // Fallback to comma-separated string
                const ids = (data as any).value
                    .split(',')
                    .map((id: string) => id.trim())
                    .filter(Boolean)
                setPlaylistIds(ids)
            }
        }
        setLoading(false)
    }

    if (loading || playlistIds.length === 0) {
        return null
    }

    // Dynamic grid classes based on number of playlists
    const getGridClass = () => {
        if (playlistIds.length === 1) return 'max-w-xl mx-auto'
        if (playlistIds.length === 2) return 'grid md:grid-cols-2 gap-6 max-w-5xl mx-auto'
        return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
    }

    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {playlistIds.length === 1 ? 'Nuestra Playlist' : 'Nuestras Playlists'}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {playlistIds.length === 1
                            ? 'Escucha nuestra selección especial en Spotify'
                            : 'Escucha nuestras selecciones especiales en Spotify'
                        }
                    </p>
                </div>

                <div className={getGridClass()}>
                    {playlistIds.map((playlistId, index) => {
                        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`

                        return (
                            <div
                                key={playlistId}
                                className="bg-card rounded-lg border border-border overflow-hidden hover:border-[#ff8906]/30 transition-colors"
                            >
                                <div className="w-full">
                                    <iframe
                                        src={embedUrl}
                                        width="100%"
                                        height="352"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        className="w-full"
                                        title={`Spotify Playlist ${index + 1}`}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

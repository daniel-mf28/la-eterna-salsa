"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getAlbumArt } from './album-art'

export type Song = {
    title: string
    artist: string
    playedAt: string
    timestamp: number
    albumArt?: string
}

type NowPlayingContextType = {
    currentSong: Song | null
    recentSongs: Song[]
    isLive: boolean
    isLoading: boolean
}

const NowPlayingContext = createContext<NowPlayingContextType>({
    currentSong: null,
    recentSongs: [],
    isLive: false,
    isLoading: true
})

// Fallback songs when Shoutcast data isn't available
// Using static timestamps to avoid hydration mismatch
const getFallbackSongs = (): Song[] => [
    { title: 'Quimbara', artist: 'Celia Cruz', playedAt: 'Hace 2 min', timestamp: Date.now() - 120000 },
    { title: 'Pedro Navaja', artist: 'Rubén Blades', playedAt: 'Hace 5 min', timestamp: Date.now() - 300000 },
    { title: 'El Gran Varón', artist: 'Willie Colón', playedAt: 'Hace 9 min', timestamp: Date.now() - 540000 },
    { title: 'Idilio', artist: 'Willie Colón', playedAt: 'Hace 13 min', timestamp: Date.now() - 780000 },
    { title: 'Aguanile', artist: 'Héctor Lavoe', playedAt: 'Hace 17 min', timestamp: Date.now() - 1020000 },
    { title: 'La Vida Es Un Carnaval', artist: 'Celia Cruz', playedAt: 'Hace 21 min', timestamp: Date.now() - 1260000 },
    { title: 'Decisiones', artist: 'Rubén Blades', playedAt: 'Hace 25 min', timestamp: Date.now() - 1500000 },
    { title: 'Mi Gente', artist: 'Héctor Lavoe', playedAt: 'Hace 29 min', timestamp: Date.now() - 1740000 },
    { title: 'Periódico de Ayer', artist: 'Héctor Lavoe', playedAt: 'Hace 33 min', timestamp: Date.now() - 1980000 },
    { title: 'Llorarás', artist: 'Oscar D\'León', playedAt: 'Hace 37 min', timestamp: Date.now() - 2220000 },
]

// Convert string to title case (capitalize first letter of each word)
function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            // Don't capitalize small words unless they're the first word
            const smallWords = ['de', 'del', 'la', 'el', 'y', 'a', 'con', 'en', 'por', 'para']
            if (smallWords.includes(word)) {
                return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
        // Always capitalize first letter
        .replace(/^./, (char) => char.toUpperCase())
}

// Parse Shoutcast song title (usually "Artist - Title" format)
function parseSongTitle(songTitle: string): { title: string; artist: string } {
    if (!songTitle) return { title: 'Sin información', artist: '' }

    const separators = [' - ', ' – ', ' — ', ' | ']

    for (const sep of separators) {
        if (songTitle.includes(sep)) {
            const parts = songTitle.split(sep)
            return {
                artist: toTitleCase(parts[0].trim()),
                title: toTitleCase(parts.slice(1).join(sep).trim() || parts[0].trim())
            }
        }
    }

    return { title: toTitleCase(songTitle.trim()), artist: 'Artista Desconocido' }
}

// Format relative time in Spanish
function formatRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'Ahora'
    if (seconds < 120) return 'Hace 1 min'
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
    if (seconds < 7200) return 'Hace 1 hora'
    return `Hace ${Math.floor(seconds / 3600)} horas`
}

export function NowPlayingProvider({ children }: { children: ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [recentSongs, setRecentSongs] = useState<Song[]>([])
    const [isLive, setIsLive] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [songHistory, setSongHistory] = useState<Song[]>([])

    useEffect(() => {
        const shoutcastUrl = process.env.NEXT_PUBLIC_SHOUTCAST_URL
        console.log('Shoutcast URL configured:', shoutcastUrl)

        if (!shoutcastUrl) {
            console.warn('NEXT_PUBLIC_SHOUTCAST_URL not configured, using fallback songs')
            // Load album art for fallback songs
            const fallbackSongs = getFallbackSongs()
            loadAlbumArtForSongs(fallbackSongs).then(songsWithArt => {
                setRecentSongs(songsWithArt)
            })
            setIsLoading(false)
            return
        }

        let lastSongTitle = ''

        const fetchCurrentSong = async () => {
            try {
                // Use our proxy API route to avoid CORS issues
                const response = await fetch('/api/now-playing', {
                    cache: 'no-store'
                })

                if (!response.ok) {
                    console.error('Now playing API failed:', response.status, response.statusText)
                    throw new Error('Failed to fetch')
                }

                const data = await response.json()
                console.log('Centova Cast data:', data)

                // Centova Cast v2 returns data in streams array
                const streamData = data.streams?.[0] || data
                const songTitle = streamData.songtitle || data.songtitle || data.title || ''

                if (songTitle && songTitle !== lastSongTitle) {
                    lastSongTitle = songTitle
                    const parsed = parseSongTitle(songTitle)

                    // Fetch album art for the new song
                    const albumArt = await getAlbumArt(parsed.artist, parsed.title)

                    const newSong: Song = {
                        ...parsed,
                        playedAt: 'Ahora',
                        timestamp: Date.now(),
                        albumArt
                    }

                    // Add to history using state setter, keeping max 10 songs
                    setSongHistory(prevHistory => {
                        const updated = [newSong, ...prevHistory]
                        return updated.slice(0, 10)
                    })

                    setCurrentSong(newSong)
                    setIsLive(true)
                }

                // Update recent songs from history (excluding current song)
                // If we have no history yet, use fallback songs
                setSongHistory(prevHistory => {
                    const updated = prevHistory.map(song => ({
                        ...song,
                        playedAt: formatRelativeTime(song.timestamp)
                    }))

                    // Update recent songs display (skip first item which is current song)
                    const toDisplay = updated.length > 1 ? updated.slice(1) : getFallbackSongs()
                    setRecentSongs(toDisplay)

                    return updated
                })

            } catch (error) {
                // Shoutcast not available, use fallback
                console.error('Error fetching now playing:', error)
                setIsLive(false)
                const fallbackSongs = getFallbackSongs()
                loadAlbumArtForSongs(fallbackSongs).then(songsWithArt => {
                    setRecentSongs(songsWithArt)
                })
            } finally {
                setIsLoading(false)
            }
        }

        // Initial fetch
        fetchCurrentSong()

        // Poll every 45 seconds for song updates
        const interval = setInterval(fetchCurrentSong, 45000)

        return () => clearInterval(interval)
    }, [])

    return (
        <NowPlayingContext.Provider value={{ currentSong, recentSongs, isLive, isLoading }}>
            {children}
        </NowPlayingContext.Provider>
    )
}

// Helper to load album art for multiple songs
async function loadAlbumArtForSongs(songs: Song[]): Promise<Song[]> {
    const songsWithArt = await Promise.all(
        songs.map(async (song) => {
            const albumArt = await getAlbumArt(song.artist, song.title)
            return { ...song, albumArt }
        })
    )
    return songsWithArt
}

export function useNowPlaying() {
    const context = useContext(NowPlayingContext)
    if (!context) {
        throw new Error('useNowPlaying must be used within a NowPlayingProvider')
    }
    return context
}

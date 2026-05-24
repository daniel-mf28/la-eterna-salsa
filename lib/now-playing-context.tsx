"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAlbumArt } from './album-art'
import {
    formatRelativeTime,
    normalizeSongIdentity,
    type NowPlayingSnapshot,
    type Song,
} from './now-playing-shared'

// Song history cache configuration
const SONG_HISTORY_KEY = 'song_history'
const SONG_HISTORY_TTL = 3 * 24 * 60 * 60 * 1000 // 3 days

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

function snapshotToHistory(snapshot: NowPlayingSnapshot | null | undefined): Song[] {
    if (!snapshot?.isLive || !snapshot.currentSong) return []
    return [snapshot.currentSong, ...snapshot.recentSongs].slice(0, 11)
}

// Load song history from localStorage
function loadSongHistory(): Song[] {
    if (typeof window === 'undefined') return []
    try {
        const cached = localStorage.getItem(SONG_HISTORY_KEY)
        if (!cached) return []
        const { songs, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp > SONG_HISTORY_TTL) {
            localStorage.removeItem(SONG_HISTORY_KEY)
            return []
        }
        return songs || []
    } catch {
        return []
    }
}

// Save song history to localStorage
function saveSongHistory(songs: Song[]): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(SONG_HISTORY_KEY, JSON.stringify({
            songs,
            timestamp: Date.now()
        }))
    } catch {
        // localStorage might be full or disabled
    }
}

function mergeWithExistingAlbumArt(nextSongs: Song[], existingSongs: Song[]): Song[] {
    const existingByIdentity = new Map(
        existingSongs.map((song) => [normalizeSongIdentity(song), song])
    )

    return nextSongs.map((song) => {
        const existing = existingByIdentity.get(normalizeSongIdentity(song))
        return existing?.albumArt ? { ...song, albumArt: existing.albumArt } : song
    })
}

export function NowPlayingProvider({
    children,
    initialSnapshot,
}: {
    children: ReactNode
    initialSnapshot?: NowPlayingSnapshot
}) {
    const initialHistory = snapshotToHistory(initialSnapshot)

    const [currentSong, setCurrentSong] = useState<Song | null>(initialSnapshot?.currentSong ?? null)
    const [recentSongs, setRecentSongs] = useState<Song[]>(initialSnapshot?.recentSongs ?? [])
    const [isLive, setIsLive] = useState(initialSnapshot?.isLive ?? false)
    const [isLoading, setIsLoading] = useState(!initialSnapshot)
    const [songHistory, setSongHistory] = useState<Song[]>(() => {
        if (initialHistory.length > 0) return initialHistory
        return loadSongHistory()
    })

    useEffect(() => {
        if (!isLive) return

        const updatedHistory = songHistory.map(song => ({
            ...song,
            playedAt: formatRelativeTime(song.timestamp)
        }))

        setCurrentSong(updatedHistory[0] ?? null)
        setRecentSongs(updatedHistory.slice(1))
        saveSongHistory(updatedHistory)
    }, [songHistory, isLive])

    useEffect(() => {
        if (!isLive || songHistory.length === 0) return

        const placeholder = '/images/vinyl-placeholder.svg'

        songHistory.forEach((song, index) => {
            if (song.albumArt && song.albumArt !== placeholder) return

            getAlbumArt(song.artist, song.title).then((albumArt) => {
                if (!albumArt || albumArt === placeholder) return

                setSongHistory((prev) => {
                    const next = [...prev]
                    if (!next[index]) return prev
                    if (normalizeSongIdentity(next[index]) !== normalizeSongIdentity(song)) return prev
                    if (next[index].albumArt === albumArt) return prev

                    next[index] = { ...next[index], albumArt }
                    return next
                })
            })
        })
    }, [songHistory, isLive])

    useEffect(() => {
        const shoutcastUrl = process.env.NEXT_PUBLIC_SHOUTCAST_URL
        console.log('Shoutcast URL configured:', shoutcastUrl)

        if (!shoutcastUrl) {
            console.warn('NEXT_PUBLIC_SHOUTCAST_URL not configured, using fallback songs')
            const fallbackSongs = getFallbackSongs()
            loadAlbumArtForSongs(fallbackSongs).then(songsWithArt => {
                setCurrentSong(null)
                setRecentSongs(songsWithArt)
                setIsLive(false)
                setIsLoading(false)
            })
            return
        }

        const fetchSnapshot = async () => {
            try {
                const response = await fetch('/api/now-playing', {
                    cache: 'no-store'
                })

                if (!response.ok) {
                    console.error('Now playing API failed:', response.status, response.statusText)
                    throw new Error('Failed to fetch')
                }

                const data: NowPlayingSnapshot = await response.json()

                if (data.isLive && data.currentSong) {
                    setIsLive(true)
                    setSongHistory((prevHistory) => {
                        const nextHistory = mergeWithExistingAlbumArt(snapshotToHistory(data), prevHistory).slice(0, 11)
                        saveSongHistory(nextHistory)
                        return nextHistory
                    })
                } else {
                    throw new Error('No live song available')
                }
            } catch (error) {
                console.error('Error fetching now playing:', error)
                setIsLive(false)
                const fallbackSongs = getFallbackSongs()
                loadAlbumArtForSongs(fallbackSongs).then(songsWithArt => {
                    setCurrentSong(null)
                    setRecentSongs(songsWithArt)
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchSnapshot()
        const interval = setInterval(fetchSnapshot, 45000)

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

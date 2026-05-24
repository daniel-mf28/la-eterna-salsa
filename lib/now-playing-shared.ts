export type Song = {
    title: string
    artist: string
    playedAt: string
    timestamp: number
    albumArt?: string
}

export type NowPlayingSnapshot = {
    currentSong: Song | null
    recentSongs: Song[]
    isLive: boolean
}

function sanitizeTrackText(str: string): string {
    return str
        .replace(/\s*\[[^\]]+\]\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

// Convert string to title case (capitalize first letter of each word)
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            const smallWords = ['de', 'del', 'la', 'el', 'y', 'a', 'con', 'en', 'por', 'para']
            if (index > 0 && smallWords.includes(word)) {
                return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
        .replace(/^./, (char) => char.toUpperCase())
}

// Parse Shoutcast song title (handles various formats)
export function parseSongTitle(songTitle: string): { title: string; artist: string } {
    if (!songTitle) return { title: 'Sin información', artist: '' }

    const cleanedTitle = sanitizeTrackText(songTitle)
    const separators = [' - ', ' – ', ' — ', ' | ']

    for (const sep of separators) {
        if (cleanedTitle.includes(sep)) {
            const parts = cleanedTitle.split(sep).map(p => p.trim())

            if (parts.length === 2 && /^\d+$/.test(parts[0])) {
                return {
                    artist: 'Artista Desconocido',
                    title: toTitleCase(parts[1])
                }
            }

            if (parts.length >= 3) {
                return {
                    artist: toTitleCase(parts[1]),
                    title: toTitleCase(parts.slice(2).join(sep))
                }
            }

            if (parts.length === 2) {
                return {
                    artist: toTitleCase(parts[0]),
                    title: toTitleCase(parts[1])
                }
            }

            return {
                title: toTitleCase(parts[0]),
                artist: 'Artista Desconocido'
            }
        }
    }

    return { title: toTitleCase(cleanedTitle), artist: 'Artista Desconocido' }
}

// Format relative time in Spanish
export function formatRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'Ahora'
    if (seconds < 120) return 'Hace 1 min'
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
    if (seconds < 7200) return 'Hace 1 hora'
    return `Hace ${Math.floor(seconds / 3600)} horas`
}

export function buildTimestampFromClock(timeText: string, now = new Date(), offsetMs = 0): number {
    const match = timeText.match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
    if (!match) return now.getTime()

    const [, hours, minutes, seconds] = match
    const candidate = new Date(now)
    candidate.setHours(Number(hours), Number(minutes), Number(seconds), 0)
    candidate.setTime(candidate.getTime() - offsetMs)

    if (candidate.getTime() > now.getTime() + 60_000) {
        candidate.setDate(candidate.getDate() - 1)
    }

    return candidate.getTime()
}

export function normalizeSongIdentity(song: Pick<Song, 'artist' | 'title'>): string {
    return `${song.artist.toLowerCase().trim()}::${song.title.toLowerCase().trim()}`
}

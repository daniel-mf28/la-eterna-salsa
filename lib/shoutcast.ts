import 'server-only'

import {
    buildTimestampFromClock,
    formatRelativeTime,
    type NowPlayingSnapshot,
    parseSongTitle,
    type Song,
} from './now-playing-shared'

function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
}

function stripTags(value: string): string {
    return value.replace(/<[^>]+>/g, '')
}

function parsePlayedHistory(html: string): Array<{ timeText: string; songTitle: string; isCurrent: boolean }> {
    const rows: Array<{ timeText: string; songTitle: string; isCurrent: boolean }> = []
    const rowRegex = /<tr><td>([^<]+)<\/td><td>([\s\S]*?)<\/td>(?:<td[^>]*><b>(Current Song)<\/b><\/td>)?<\/tr>/g

    for (const match of html.matchAll(rowRegex)) {
        const timeText = match[1]?.trim()
        const songTitle = decodeHtmlEntities(stripTags(match[2] ?? ''))

        if (!timeText || !songTitle || songTitle === 'Song Title') {
            continue
        }

        rows.push({
            timeText,
            songTitle,
            isCurrent: match[3] === 'Current Song',
        })
    }

    return rows
}

function buildSong(songTitle: string, timestamp: number): Song {
    const parsed = parseSongTitle(songTitle)

    return {
        ...parsed,
        playedAt: formatRelativeTime(timestamp),
        timestamp,
    }
}

function inferClockOffset(rows: Array<{ timeText: string; songTitle: string; isCurrent: boolean }>, now: Date): number {
    const currentRow = rows.find((row) => row.isCurrent) ?? rows[0]
    if (!currentRow) return 0

    const naiveTimestamp = buildTimestampFromClock(currentRow.timeText, now, 0)
    return naiveTimestamp - now.getTime()
}

export async function fetchNowPlayingSnapshot(): Promise<NowPlayingSnapshot> {
    const shoutcastUrl = process.env.NEXT_PUBLIC_SHOUTCAST_URL

    if (!shoutcastUrl) {
        return {
            currentSong: null,
            recentSongs: [],
            isLive: false,
        }
    }

    try {
        const [statsResponse, historyResponse] = await Promise.all([
            fetch(`${shoutcastUrl}/statistics?json=1`, {
                cache: 'no-store',
                headers: { 'User-Agent': 'Mozilla/5.0' },
            }),
            fetch(`${shoutcastUrl}/played.html?sid=1`, {
                cache: 'no-store',
                headers: { 'User-Agent': 'Mozilla/5.0' },
            }),
        ])

        if (!statsResponse.ok) {
            return {
                currentSong: null,
                recentSongs: [],
                isLive: false,
            }
        }

        const stats = await statsResponse.json()
        const streamData = stats.streams?.[0] || stats
        const currentTitle = streamData.songtitle || stats.songtitle || stats.title || ''

        let currentSong: Song | null = null
        let recentSongs: Song[] = []

        if (historyResponse.ok) {
            const historyHtml = await historyResponse.text()
            const rows = parsePlayedHistory(historyHtml)
            const now = new Date()
            const inferredOffset = inferClockOffset(rows, now)
            const songs = rows.map((row) => buildSong(row.songTitle, buildTimestampFromClock(row.timeText, now, inferredOffset)))

            if (songs.length > 0) {
                const currentIndex = rows.findIndex((row) => row.isCurrent)
                const resolvedCurrentIndex = currentIndex >= 0 ? currentIndex : 0
                currentSong = songs[resolvedCurrentIndex] ?? null
                recentSongs = songs.filter((_, index) => index !== resolvedCurrentIndex).slice(0, 10)
            }
        }

        if (!currentSong && currentTitle) {
            currentSong = buildSong(currentTitle, Date.now())
        }

        return {
            currentSong,
            recentSongs,
            isLive: Boolean(currentSong),
        }
    } catch (error) {
        console.error('Error fetching Shoutcast snapshot:', error)
        return {
            currentSong: null,
            recentSongs: [],
            isLive: false,
        }
    }
}

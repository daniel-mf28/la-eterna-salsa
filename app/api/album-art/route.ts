import { NextRequest, NextResponse } from 'next/server'

type SpotifyTrack = {
    name: string
    artists?: Array<{ name: string }>
    album?: {
        images?: Array<{ url: string }>
        name?: string
    }
}

// Cache Spotify access token in memory
let spotifyToken: { token: string; expires: number } | null = null

async function getSpotifyToken(): Promise<string | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) return null

    if (spotifyToken && Date.now() < spotifyToken.expires) {
        return spotifyToken.token
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
            },
            body: 'grant_type=client_credentials'
        })

        if (!response.ok) return null

        const data = await response.json()
        spotifyToken = {
            token: data.access_token,
            expires: Date.now() + (data.expires_in - 300) * 1000
        }

        return spotifyToken.token
    } catch {
        return null
    }
}

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\b(?:feat|featuring|ft)\.?\b.*$/i, ' ')
        .replace(/[!.,/\\]+/g, ' ')
        .replace(/\b\d{4}\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
}

function buildSearchVariants(artist: string, title: string): string[] {
    const cleanArtist = normalizeSearchText(artist)
    const cleanTitle = normalizeSearchText(title)
    const titleWithoutLeadingTrackNumber = cleanTitle.replace(/^\d+\s*-\s*/, '').trim()

    const candidates = [
        `artist:${cleanArtist} track:${titleWithoutLeadingTrackNumber || cleanTitle}`,
        `"${cleanArtist}" "${titleWithoutLeadingTrackNumber || cleanTitle}"`,
        `${cleanArtist} ${titleWithoutLeadingTrackNumber || cleanTitle}`,
        titleWithoutLeadingTrackNumber || cleanTitle,
        `${titleWithoutLeadingTrackNumber || cleanTitle} ${cleanArtist}`,
    ]

    return [...new Set(candidates.filter(Boolean))]
}

function scoreTrackMatch(track: SpotifyTrack, artist: string, title: string): number {
    const wantedArtist = normalizeSearchText(artist)
    const wantedTitle = normalizeSearchText(title).replace(/^\d+\s*-\s*/, '').trim()
    const trackName = normalizeSearchText(track.name || '')
    const albumName = normalizeSearchText(track.album?.name || '')
    const artistNames = (track.artists || []).map((entry) => normalizeSearchText(entry.name))

    let score = 0

    if (trackName === wantedTitle) score += 120
    else if (trackName.includes(wantedTitle) || wantedTitle.includes(trackName)) score += 80

    if (artistNames.some((name) => name === wantedArtist)) score += 120
    else if (artistNames.some((name) => name.includes(wantedArtist) || wantedArtist.includes(name))) score += 75

    if (albumName.includes(wantedTitle)) score += 20

    return score
}

async function searchSpotify(token: string, query: string): Promise<SpotifyTrack[]> {
    const encodedQuery = encodeURIComponent(query)
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=5`

    const response = await fetch(searchUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        console.warn(`Spotify search failed for "${query}": ${response.status}`)
        return []
    }

    const data = await response.json()
    return data?.tracks?.items || []
}

async function findBestSpotifyTrack(token: string, artist: string, title: string): Promise<SpotifyTrack | null> {
    const variants = buildSearchVariants(artist, title)
    let bestTrack: SpotifyTrack | null = null
    let bestScore = -1

    for (const query of variants) {
        const tracks = await searchSpotify(token, query)

        for (const track of tracks) {
            const score = scoreTrackMatch(track, artist, title)
            if (score > bestScore) {
                bestScore = score
                bestTrack = track
            }
        }

        if (bestScore >= 200) {
            break
        }
    }

    return bestTrack
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const artist = searchParams.get('artist')
    const title = searchParams.get('title')

    if (!artist || !title) {
        console.error('Album art request missing artist or title')
        return NextResponse.json({ error: 'Missing artist or title' }, { status: 400 })
    }

    console.log(`Fetching album art for: ${artist} - ${title}`)

    const token = await getSpotifyToken()
    if (!token) {
        console.warn('Spotify token not available - check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET')
        return NextResponse.json({ imageUrl: null }, { status: 200 })
    }

    try {
        const track = await findBestSpotifyTrack(token, artist, title)

        if (!track?.album?.images?.length) {
            console.log(`No album art found for: ${artist} - ${title}`)
            return NextResponse.json({ imageUrl: null }, { status: 200 })
        }

        const imageUrl = track.album.images[0].url
        console.log(`Found album art for ${artist} - ${title}: ${imageUrl}`)

        return NextResponse.json(
            { imageUrl },
            {
                headers: {
                    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
                }
            }
        )
    } catch {
        return NextResponse.json({ imageUrl: null }, { status: 200 })
    }
}

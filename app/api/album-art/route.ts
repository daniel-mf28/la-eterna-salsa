import { NextRequest, NextResponse } from 'next/server'

// Cache Spotify access token in memory
let spotifyToken: { token: string; expires: number } | null = null

async function getSpotifyToken(): Promise<string | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) return null

    // Return cached token if still valid
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

        // Cache token with 5 minute buffer before expiry
        spotifyToken = {
            token: data.access_token,
            expires: Date.now() + (data.expires_in - 300) * 1000
        }

        return spotifyToken.token
    } catch {
        return null
    }
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
        // Try precise search first
        let query = encodeURIComponent(`artist:${artist} track:${title}`)
        let searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`

        let response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            console.warn(`Spotify search failed: ${response.status}`)
            return NextResponse.json({ imageUrl: null }, { status: 200 })
        }

        let data = await response.json()
        let track = data?.tracks?.items?.[0]

        // If no results, try a broader search (just the title)
        if (!track) {
            console.log(`No exact match, trying broader search for: ${title}`)
            query = encodeURIComponent(title)
            searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`

            response = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                data = await response.json()
                track = data?.tracks?.items?.[0]
            }
        }

        if (!track?.album?.images?.length) {
            console.log(`No album art found for: ${artist} - ${title}`)
            return NextResponse.json({ imageUrl: null }, { status: 200 })
        }

        // Get the largest image (first in array is usually 640x640)
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

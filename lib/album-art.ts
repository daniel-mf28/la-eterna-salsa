// Album Art Service with multi-API fallback and caching
// Tries: Spotify -> Last.fm -> Placeholder

const CACHE_KEY_PREFIX = 'albumart:'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// In-memory cache for current session
const memoryCache = new Map<string, string>()

// Normalize artist/title for cache key
function normalizeKey(artist: string, title: string): string {
    return `${CACHE_KEY_PREFIX}${artist.toLowerCase().trim()}:${title.toLowerCase().trim()}`
}

// Check localStorage cache
function getFromLocalStorage(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
        const cached = localStorage.getItem(key)
        if (!cached) return null
        const { url, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(key)
            return null
        }
        return url
    } catch {
        return null
    }
}

// Save to localStorage
function saveToLocalStorage(key: string, url: string): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(key, JSON.stringify({ url, timestamp: Date.now() }))
    } catch {
        // localStorage might be full or disabled
    }
}

// Try Last.fm API (client-side, no server-only keys needed)
async function fetchFromLastFm(artist: string, title: string): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY
    if (!apiKey) return null

    try {
        const params = new URLSearchParams({
            method: 'track.getInfo',
            api_key: apiKey,
            artist: artist,
            track: title,
            format: 'json'
        })

        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`, {
            cache: 'force-cache'
        })

        if (!response.ok) return null

        const data = await response.json()

        // Last.fm returns images in album.image array
        // Sizes: small, medium, large, extralarge
        const images = data?.track?.album?.image
        if (!images || !Array.isArray(images)) return null

        // Get the largest available image (extralarge or large)
        const extralarge = images.find((img: { size: string; '#text': string }) => img.size === 'extralarge')
        const large = images.find((img: { size: string; '#text': string }) => img.size === 'large')
        const imageUrl = extralarge?.['#text'] || large?.['#text']

        // Last.fm sometimes returns empty string for missing images
        if (!imageUrl || imageUrl === '') return null

        return imageUrl
    } catch {
        return null
    }
}

// Spotify API endpoint (requires server-side route for token)
async function fetchFromSpotify(artist: string, title: string): Promise<string | null> {
    try {
        // Use our API route that handles Spotify auth
        const params = new URLSearchParams({ artist, title })
        const response = await fetch(`/api/album-art?${params}`, {
            cache: 'force-cache'
        })

        if (!response.ok) return null

        const data = await response.json()
        return data.imageUrl || null
    } catch {
        return null
    }
}

// Main function to get album art
export async function getAlbumArt(artist: string, title: string): Promise<string> {
    const placeholder = '/images/vinyl-placeholder.svg'

    if (!artist || !title) return placeholder

    const cacheKey = normalizeKey(artist, title)

    // 1. Check memory cache
    const memoryCached = memoryCache.get(cacheKey)
    if (memoryCached) return memoryCached

    // 2. Check localStorage cache
    const localCached = getFromLocalStorage(cacheKey)
    if (localCached) {
        memoryCache.set(cacheKey, localCached)
        return localCached
    }

    // 3. Try Spotify first (most accurate for Latin music)
    const spotifyUrl = await fetchFromSpotify(artist, title)
    if (spotifyUrl) {
        memoryCache.set(cacheKey, spotifyUrl)
        saveToLocalStorage(cacheKey, spotifyUrl)
        return spotifyUrl
    }

    // 4. Try Last.fm as fallback
    const lastFmUrl = await fetchFromLastFm(artist, title)
    if (lastFmUrl) {
        memoryCache.set(cacheKey, lastFmUrl)
        saveToLocalStorage(cacheKey, lastFmUrl)
        return lastFmUrl
    }

    // 5. Return placeholder
    memoryCache.set(cacheKey, placeholder)
    return placeholder
}

// Hook for React components
export function useAlbumArt(artist: string, title: string): { imageUrl: string; isLoading: boolean } {
    // This will be imported and used with useState/useEffect in components
    // Keeping this here as a type reference for now
    return { imageUrl: '/images/vinyl-placeholder.svg', isLoading: false }
}

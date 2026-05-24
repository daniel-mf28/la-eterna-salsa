import { NextResponse } from 'next/server'
import { fetchNowPlayingSnapshot } from '@/lib/shoutcast'

export async function GET() {
    const snapshot = await fetchNowPlayingSnapshot()

    return NextResponse.json(snapshot, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

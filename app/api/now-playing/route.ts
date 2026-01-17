import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const centovaCastUrl = process.env.NEXT_PUBLIC_SHOUTCAST_URL

    if (!centovaCastUrl) {
        return NextResponse.json({ error: 'Centova Cast URL not configured' }, { status: 500 })
    }

    try {
        const response = await fetch(`${centovaCastUrl}/statistics?json=1`, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (!response.ok) {
            console.error('Centova Cast fetch failed:', response.status, response.statusText)
            return NextResponse.json({ error: 'Failed to fetch from Centova Cast' }, { status: response.status })
        }

        const data = await response.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (error) {
        console.error('Error fetching Centova Cast data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Radio, ExternalLink, Music, Headphones, Disc, Wifi } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type PlatformLink = Database['public']['Tables']['platform_links']['Row']

// Icon mapping from string to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    radio: Radio,
    music: Music,
    headphones: Headphones,
    disc: Disc,
    wifi: Wifi,
}

// Fallback platforms when database is empty
const fallbackPlatforms: PlatformLink[] = [
    {
        id: 'fallback-1',
        name: 'TuneIn',
        url: 'https://tunein.com',
        icon: 'radio',
        display_order: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 'fallback-2',
        name: 'Radio.net',
        url: 'https://radio.net',
        icon: 'wifi',
        display_order: 2,
        created_at: new Date().toISOString()
    },
    {
        id: 'fallback-3',
        name: 'Reproductor Web',
        url: '#player',
        icon: 'headphones',
        display_order: 3,
        created_at: new Date().toISOString()
    }
]

export function ListenPlatformsSection() {
    const [platforms, setPlatforms] = useState<PlatformLink[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPlatforms = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('platform_links')
                    .select('*')
                    .order('display_order', { ascending: true })

                if (error) {
                    console.error('Error fetching platforms:', error)
                    setPlatforms(fallbackPlatforms)
                } else if (data && Array.isArray(data)) {
                    // Filter out platforms with null or empty URLs
                    const validPlatforms = data.filter(
                        (platform: any) => platform.url && platform.url.trim() !== ''
                    )
                    // Use database data if available, otherwise use fallback
                    setPlatforms(validPlatforms.length > 0 ? validPlatforms : fallbackPlatforms)
                } else {
                    setPlatforms(fallbackPlatforms)
                }
            } catch (error) {
                console.error('Error loading platforms:', error)
                setPlatforms(fallbackPlatforms)
            } finally {
                setLoading(false)
            }
        }

        loadPlatforms()
    }, [])

    if (loading) {
        return null // Or a skeleton loader
    }

    return (
        <section className="py-16 md:py-24 bg-card/30 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 80% 20%, rgba(242, 95, 76, 0.07) 0%, transparent 40%),
                        radial-gradient(circle at 20% 80%, rgba(229, 49, 112, 0.05) 0%, transparent 35%)
                    `,
                }}
            />
            <div className="container relative z-10">
                <div className="space-y-8 text-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold">Escuchar Radio Salsa en Vivo Gratis</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Encuéntranos en las mejores plataformas para escuchar emisoras de salsa online
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {platforms.map((platform) => {
                            // Get the icon component, fallback to Radio if not found
                            const IconComponent = iconMap[platform.icon.toLowerCase()] || Radio

                            return (
                                <Button
                                    key={platform.id}
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="h-auto py-4 px-6 flex items-center space-x-2"
                                >
                                    <Link href={platform.url} target="_blank" rel="noopener noreferrer">
                                        <IconComponent className="h-5 w-5" />
                                        <span className="font-semibold">{platform.name}</span>
                                        <ExternalLink className="h-4 w-4 opacity-50" />
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

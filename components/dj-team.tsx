'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'

type DJ = {
    id: string
    name: string
    photo_url: string | null
    schedule: string | null
    bio: string | null
    social_links: any | null
    display_order: number
}

// Fallback DJs when database is empty
const fallbackDJs: DJ[] = [
    {
        id: 'fallback-1',
        name: 'DJ Clásico',
        photo_url: null,
        schedule: 'Lunes a Viernes, 6:00 AM - 12:00 PM',
        bio: 'Experto en salsa de la vieja guardia y clásicos inmortales.',
        social_links: null,
        display_order: 1
    },
    {
        id: 'fallback-2',
        name: 'DJ Brava',
        photo_url: null,
        schedule: 'Lunes a Viernes, 12:00 PM - 6:00 PM',
        bio: 'Especialista en salsa brava y sonidos duros de Nueva York.',
        social_links: null,
        display_order: 2
    },
    {
        id: 'fallback-3',
        name: 'DJ Nocturno',
        photo_url: null,
        schedule: 'Diariamente, 6:00 PM - 12:00 AM',
        bio: 'Las mejores selecciones de salsa romántica y clásica para la noche.',
        social_links: null,
        display_order: 3
    }
]

function DJCard({ dj }: { dj: DJ }) {
    return (
        <Card className="hover:shadow-lg transition-shadow hover:border-[#ff8906]/30">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="size-16 ring-2 ring-[#ff8906]">
                        <AvatarImage
                            src={dj.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${dj.name}`}
                            alt={dj.name}
                        />
                        <AvatarFallback className="bg-[#ff8906] text-white text-xl">
                            {dj.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">{dj.name}</h3>
                        {dj.schedule && (
                            <p className="text-xs text-muted-foreground mt-1">{dj.schedule}</p>
                        )}
                        {dj.bio && (
                            <p className="text-sm text-muted-foreground mt-2">{dj.bio}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function DJTeamSection() {
    const [djs, setDjs] = useState<DJ[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDJs = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('djs')
                    .select('*')
                    .order('display_order', { ascending: true })

                if (error) {
                    console.error('Error fetching DJs:', error)
                    setDjs(fallbackDJs)
                } else {
                    // Use database data if available, otherwise use fallback
                    setDjs(data && data.length > 0 ? data : fallbackDJs)
                }
            } catch (error) {
                console.error('Error fetching DJs:', error)
                setDjs(fallbackDJs)
            } finally {
                setLoading(false)
            }
        }

        fetchDJs()
    }, [])

    if (loading) {
        return (
            <section className="py-16 md:py-24 bg-card/30 relative overflow-hidden">
                <div className="container relative z-10">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Nuestros DJs</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Conoce a los talentosos DJs que hacen vibrar nuestra programación
                        </p>
                    </div>
                    <div className="text-center text-muted-foreground">Cargando...</div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 md:py-24 bg-card/30 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 10% 30%, rgba(229, 49, 112, 0.08) 0%, transparent 45%),
                        radial-gradient(circle at 90% 70%, rgba(255, 137, 6, 0.06) 0%, transparent 40%)
                    `,
                }}
            />
            <div className="container relative z-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Nuestros DJs</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Conoce a los talentosos DJs que hacen vibrar nuestra programación
                    </p>
                </div>

                {/* Mobile: horizontal scroll */}
                <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {djs.map((dj) => (
                            <div key={dj.id} className="flex-shrink-0 w-64 snap-start">
                                <DJCard dj={dj} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop: 3-column grid */}
                <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {djs.map((dj) => (
                        <DJCard key={dj.id} dj={dj} />
                    ))}
                </div>
            </div>
        </section>
    )
}

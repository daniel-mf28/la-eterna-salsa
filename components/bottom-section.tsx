'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Radio } from 'lucide-react'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

function TuneInLogo() {
    return (
        <div className="flex items-center gap-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#0A3538" strokeWidth="1.5" />
                <path d="M8 8v8M12 6v12M16 9v6" stroke="#0A3538" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-sans text-[16px] font-bold text-[#0A3538] tracking-tight">TuneIn</span>
        </div>
    )
}

function RadioNetLogo() {
    return (
        <div className="flex items-center gap-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" fill="#0A3538" />
                <path d="M8.5 16.5a5 5 0 010-9M15.5 7.5a5 5 0 010 9" stroke="#0A3538" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5.5 19a9 9 0 010-14M18.5 5a9 9 0 010 14" stroke="#0A3538" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-sans text-[16px] font-bold text-[#0A3538] tracking-tight">radio.net</span>
        </div>
    )
}

type PlatformLink = Database['public']['Tables']['platform_links']['Row']

interface FAQ {
    id: string
    question: string
    answer: string
    display_order: number
}

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
]

const fallbackFAQs: FAQ[] = [
    {
        id: 'fallback-1',
        question: '1. ¿Cómo puedo escuchar La Eterna Salsa?',
        answer: 'Puedes escucharnos directamente desde nuestra página web usando el reproductor en la página principal, o a través de plataformas como TuneIn y Radio.net.',
        display_order: 1
    },
    {
        id: 'fallback-2',
        question: '2. ¿Es gratis escuchar la radio?',
        answer: 'Sí, La Eterna Salsa es completamente gratuita. No necesitas suscripción ni pago alguno.',
        display_order: 2
    },
    {
        id: 'fallback-3',
        question: '3. ¿Puedo pedir canciones o dedicatorias?',
        answer: 'Sí, puedes enviarnos tus saludos y dedicatorias a través de nuestra sección de Shoutouts.',
        display_order: 3
    },
    {
        id: 'fallback-4',
        question: '4. ¿Desde dónde nos escuchas?',
        answer: 'Nos puedes escuchar desde cualquier parte del mundo con conexión a internet.',
        display_order: 4
    },
    {
        id: 'fallback-5',
        question: '5. ¿Dónde puedo anunciarme en la emisora?',
        answer: 'Contáctanos a través de nuestro correo electrónico para información sobre publicidad y anuncios en la emisora.',
        display_order: 5
    }
]

export function BottomSection() {
    const [platforms, setPlatforms] = useState<PlatformLink[]>([])
    const [faqItems, setFaqItems] = useState<FAQ[]>([])
    const [openFaq, setOpenFaq] = useState<string | null>('fallback-1')

    useEffect(() => {
        async function fetchData() {
            if (!isSupabaseConfigured()) {
                setPlatforms(fallbackPlatforms)
                setFaqItems(fallbackFAQs)
                return
            }

            const supabase = createClient()

            // Fetch platforms
            try {
                const { data, error } = await supabase
                    .from('platform_links')
                    .select('*')
                    .order('display_order', { ascending: true })

                if (error || !data || data.length === 0) {
                    setPlatforms(fallbackPlatforms)
                } else {
                    const valid = data.filter((p: any) => p.url && p.url.trim() !== '')
                    setPlatforms(valid.length > 0 ? valid : fallbackPlatforms)
                }
            } catch {
                setPlatforms(fallbackPlatforms)
            }

            // Fetch FAQs
            try {
                const { data, error } = await supabase
                    .from('faqs')
                    .select('*')
                    .order('display_order', { ascending: true })

                if (error || !data || data.length === 0) {
                    setFaqItems(fallbackFAQs)
                } else {
                    setFaqItems(data as any)
                    setOpenFaq((data as any)[0]?.id || null)
                }
            } catch {
                setFaqItems(fallbackFAQs)
            }
        }

        fetchData()
    }, [])

    return (
        <section className="w-full px-4 md:px-6">
            <div
                className="max-w-[1398px] mx-auto rounded-2xl md:rounded-3xl p-5 md:px-12 md:py-10"
                style={{
                    background: "#FBF1E4",
                    boxShadow: "0 4px 20px rgba(10, 53, 56, 0.15)",
                }}
            >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-5">
                    {/* Left column - Listen Platforms */}
                    <div className="lg:w-[380px] flex-shrink-0 flex flex-col items-center text-center">
                        <h3 className="font-sans text-[14px] font-extrabold tracking-wider text-[#0A3538] uppercase">
                            ESCÚCHANOS TAMBIÉN EN
                        </h3>
                        <p className="font-sans text-[12px] italic text-[#5B7368] mt-2 max-w-[300px]">
                            Escucha La Eterna Salsa también en tus plataformas favoritas.
                        </p>
                        <div className="flex gap-5 mt-6">
                            {platforms.slice(0, 2).map((platform) => (
                                <Link
                                    key={platform.id}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-[160px] h-[70px] bg-white border border-[#C7C0AF] rounded-[10px] hover:shadow-md transition-shadow"
                                    style={{ boxShadow: "0 2px 8px rgba(10, 53, 56, 0.06)" }}
                                >
                                    {platform.name.toLowerCase().includes('tunein') ? (
                                        <TuneInLogo />
                                    ) : platform.name.toLowerCase().includes('radio') ? (
                                        <RadioNetLogo />
                                    ) : (
                                        <span className="font-sans text-sm font-semibold text-[#0A3538]">
                                            {platform.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden lg:block w-px bg-[#C7C0AF]/30 self-stretch" />

                    {/* Horizontal divider on mobile */}
                    <div className="lg:hidden h-px bg-[#C7C0AF]/30 w-full" />

                    {/* Right column - FAQ */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-sans text-[16px] font-extrabold tracking-[2px] text-[#0A3538] uppercase">
                            PREGUNTAS FRECUENTES
                        </h3>
                        <div className="h-px bg-[#C7C0AF] w-full mt-3 mb-3" />
                        <p className="font-sans text-[13px] text-[#5B7368] mb-4">
                            Resolvemos las dudas más comunes sobre La Eterna Salsa.
                        </p>

                        <div className="space-y-0">
                            {faqItems.map((item) => {
                                const isOpen = openFaq === item.id
                                return (
                                    <div key={item.id} className="border-b border-[#C7C0AF]/50">
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : item.id)}
                                            className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
                                        >
                                            <span className="font-sans text-[13px] font-semibold text-[#0E1817] pr-4">
                                                {item.question}
                                            </span>
                                            <ChevronDown
                                                className={`h-4 w-4 text-[#5B7368] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="pb-3 pl-4 flex items-start gap-3">
                                                <Radio className="h-6 w-6 text-[#C2491F] flex-shrink-0" />
                                                <p className="font-sans text-[12px] text-[#5B7368] leading-[1.5]">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

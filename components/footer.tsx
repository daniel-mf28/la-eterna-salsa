"use client"

import { useState, useEffect } from 'react'
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface SocialLink {
    id: string
    platform: string
    url: string
    created_at: string
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
}

const fallbackSocialLinks: SocialLink[] = [
    { id: 'fallback-1', platform: 'facebook', url: 'https://facebook.com/laeternasalsa', created_at: new Date().toISOString() },
    { id: 'fallback-2', platform: 'instagram', url: 'https://instagram.com/laeternasalsa', created_at: new Date().toISOString() },
    { id: 'fallback-3', platform: 'youtube', url: 'https://youtube.com/@laeternasalsa', created_at: new Date().toISOString() },
    { id: 'fallback-4', platform: 'twitter', url: 'https://twitter.com/laeternasalsa', created_at: new Date().toISOString() },
]

export function Footer() {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchSocialLinks() {
            try {
                const { data, error } = await supabase
                    .from('social_links')
                    .select('*')
                    .order('created_at', { ascending: true })

                if (error) {
                    setSocialLinks(fallbackSocialLinks)
                } else if (data && Array.isArray(data)) {
                    const validLinks = data.filter((link: any) => link.url && link.url.trim() !== '')
                    setSocialLinks(validLinks.length > 0 ? validLinks : fallbackSocialLinks)
                } else {
                    setSocialLinks(fallbackSocialLinks)
                }
            } catch {
                setSocialLinks(fallbackSocialLinks)
            }
        }

        fetchSocialLinks()
    }, [])

    return (
        <footer
            className="relative w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/footer-bg.png')" }}
        >
            {/* Teal overlay */}
            <div className="absolute inset-0 bg-[#0A3538]/72" />

            {/* Content */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-10">
                <div className="flex flex-col items-center text-center gap-4">
                    {/* Logo */}
                    <h2 className="font-[family-name:var(--font-playfair)] italic font-bold text-[26px] md:text-[32px] text-white leading-[0.9] whitespace-pre-line">
                        {"la\neterna salsa"}
                    </h2>
                    <p className="font-sans text-[10px] font-bold text-white/60 tracking-[4px] uppercase">
                        RADIO ONLINE
                    </p>
                    <p className="font-[family-name:var(--font-playfair)] italic text-[16px] md:text-[18px] text-white/60">
                        La salsa que vive en el corazón
                    </p>

                    {/* Social Icons — prominent */}
                    <div className="flex gap-4 pt-2">
                        {socialLinks.map((link) => {
                            const IconComponent = platformIcons[link.platform.toLowerCase()]
                            if (!IconComponent) return null
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 text-white hover:bg-white/15 hover:border-white transition-all duration-200"
                                    aria-label={`Síguenos en ${link.platform}`}
                                >
                                    <IconComponent className="h-5 w-5" />
                                </a>
                            )
                        })}
                    </div>

                    {/* Contact email */}
                    <a
                        href="mailto:contacto@laeternasalsa.com"
                        className="font-sans text-[13px] text-white/50 hover:text-white transition-colors"
                    >
                        contacto@laeternasalsa.com
                    </a>
                </div>

                {/* Copyright */}
                <div className="mt-6 pt-4 border-t border-white/15">
                    <p className="font-sans text-[12px] text-white/40 text-center">
                        &copy; {new Date().getFullYear()} La Eterna Salsa Radio Online. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}

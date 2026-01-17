"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Mail, Phone, Twitter, Linkedin, Github } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface SocialLink {
    id: string
    platform: string
    url: string
    created_at: string
}

const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
}

// Fallback social links when database is empty
const fallbackSocialLinks: SocialLink[] = [
    {
        id: 'fallback-1',
        platform: 'facebook',
        url: 'https://facebook.com/laeternasalsa',
        created_at: new Date().toISOString()
    },
    {
        id: 'fallback-2',
        platform: 'instagram',
        url: 'https://instagram.com/laeternasalsa',
        created_at: new Date().toISOString()
    },
    {
        id: 'fallback-3',
        platform: 'youtube',
        url: 'https://youtube.com/@laeternasalsa',
        created_at: new Date().toISOString()
    }
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
                    console.error('Error fetching social links:', error)
                    setSocialLinks(fallbackSocialLinks)
                } else if (data) {
                    // Filter out links with empty/null URLs
                    const validLinks = data.filter(link => link.url && link.url.trim() !== '')
                    // Use database data if available, otherwise use fallback
                    setSocialLinks(validLinks.length > 0 ? validLinks : fallbackSocialLinks)
                } else {
                    setSocialLinks(fallbackSocialLinks)
                }
            } catch (error) {
                console.error('Error fetching social links:', error)
                setSocialLinks(fallbackSocialLinks)
            }
        }

        fetchSocialLinks()
    }, [])

    const getIconComponent = (platform: string) => {
        const normalizedPlatform = platform.toLowerCase()
        return platformIcons[normalizedPlatform as keyof typeof platformIcons] || null
    }

    return (
        <footer className="border-t border-[#D32F2F]/20 bg-card/50 relative overflow-hidden">
            {/* Subtle gradient at bottom */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 50% 100%, rgba(211, 47, 47, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 20% 90%, rgba(251, 192, 0, 0.1) 0%, transparent 35%)
                    `,
                }}
            />
            <div className="container py-12 md:py-16 relative z-10">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Image
                                src="/Logo.png"
                                alt="La Eterna Salsa Logo"
                                width={48}
                                height={48}
                                className="h-12 w-auto"
                            />
                            <span className="font-bold text-lg bg-gradient-to-r from-[#FBC000] to-[#D32F2F] bg-clip-text text-transparent">La Eterna Salsa</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Emisora de radio salsa en vivo las 24 horas. Salsa clásica, brava y vieja guardia gratis online desde Colombia.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-[#FBC000] transition-colors">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/programacion" className="text-muted-foreground hover:text-[#FBC000] transition-colors">
                                    Programación
                                </Link>
                            </li>
                            <li>
                                <Link href="/djs" className="text-muted-foreground hover:text-[#FBC000] transition-colors">
                                    Nuestros DJs
                                </Link>
                            </li>
                            <li>
                                <Link href="/contacto" className="text-muted-foreground hover:text-[#FBC000] transition-colors">
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contacto</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Mail className="h-4 w-4 text-[#FBC000]" />
                                <a href="mailto:contacto@laeternasalsa.com" className="hover:text-[#FBC000] transition-colors">
                                    contacto@laeternasalsa.com
                                </a>
                            </li>
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Phone className="h-4 w-4 text-[#FBC000]" />
                                <a href="tel:+573001234567" className="hover:text-[#FBC000] transition-colors">
                                    +57 300 123 4567
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="font-semibold mb-4">Síguenos</h3>
                        <div className="flex space-x-4">
                            {socialLinks.map((link) => {
                                const IconComponent = getIconComponent(link.platform)

                                if (!IconComponent) return null

                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC000] text-white hover:scale-110 transition-transform shadow-lg"
                                        aria-label={link.platform}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} La Eterna Salsa. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}

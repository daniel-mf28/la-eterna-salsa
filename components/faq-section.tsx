'use client'

import { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface FAQ {
    id: string
    question: string
    answer: string
    display_order: number
}

// Fallback FAQs when database is empty
const fallbackFAQs: FAQ[] = [
    {
        id: 'fallback-1',
        question: '¿Qué tipo de música transmite La Eterna Salsa?',
        answer: 'Transmitimos salsa clásica, brava y de la vieja guardia las 24 horas del día. Nuestra programación incluye los mejores éxitos de leyendas como Héctor Lavoe, Willie Colón, Celia Cruz, y muchos más.',
        display_order: 1
    },
    {
        id: 'fallback-2',
        question: '¿La transmisión es completamente gratis?',
        answer: 'Sí, La Eterna Salsa es una emisora de radio salsa completamente gratuita. Puedes escucharnos en vivo online sin ningún costo ni suscripción.',
        display_order: 2
    },
    {
        id: 'fallback-3',
        question: '¿Cómo puedo escuchar la emisora?',
        answer: 'Puedes escucharnos directamente desde nuestra página web usando el reproductor en la página principal, o a través de las plataformas de streaming que listamos en la sección "Escuchar".',
        display_order: 3
    },
    {
        id: 'fallback-4',
        question: '¿Puedo solicitar canciones o enviar saludos?',
        answer: 'Sí, puedes enviarnos tus saludos y dedicatorias a través de nuestra sección de Shoutouts. Tu mensaje aparecerá en pantalla durante la transmisión.',
        display_order: 4
    },
    {
        id: 'fallback-5',
        question: '¿Están disponibles las 24 horas?',
        answer: 'Sí, transmitimos salsa en vivo las 24 horas del día, los 7 días de la semana. La música nunca para en La Eterna Salsa.',
        display_order: 5
    }
]

export function FAQSection() {
    const [faqItems, setFaqItems] = useState<FAQ[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchFAQs() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('faqs')
                    .select('*')
                    .order('display_order', { ascending: true })

                if (error) {
                    console.error('Error fetching FAQs:', error)
                    setFaqItems(fallbackFAQs)
                    return
                }

                // Use database data if available, otherwise use fallback
                setFaqItems(data && data.length > 0 ? data : fallbackFAQs)
            } catch (error) {
                console.error('Error fetching FAQs:', error)
                setFaqItems(fallbackFAQs)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFAQs()
    }, [])

    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-5 md:gap-12">
                    <div className="md:col-span-2">
                        <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
                        <p className="text-muted-foreground mt-4 text-balance text-lg">
                            Lo que necesitas saber
                        </p>
                        <p className="text-muted-foreground mt-6 hidden md:block">
                            ¿No encuentras lo que buscas? Contáctanos a través de{' '}
                            <Link
                                href="/contacto"
                                className="text-[#ff8906] font-medium hover:underline">
                                nuestra página de contacto
                            </Link>
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-muted-foreground">Cargando preguntas...</div>
                            </div>
                        ) : (
                            <Accordion
                                type="single"
                                collapsible>
                                {faqItems.map((item) => (
                                    <AccordionItem
                                        key={item.id}
                                        value={item.id}>
                                        <AccordionTrigger className="cursor-pointer text-left text-base hover:no-underline">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-base text-muted-foreground">{item.answer}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>

                    <p className="text-muted-foreground mt-6 md:hidden">
                        ¿No encuentras lo que buscas? Contáctanos a través de{' '}
                        <Link
                            href="/contacto"
                            className="text-[#ff8906] font-medium hover:underline">
                            nuestra página de contacto
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

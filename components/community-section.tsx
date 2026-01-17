import { Users, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CommunitySection() {
    return (
        <section className="py-12 md:py-16 bg-card/30 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 70% 50%, rgba(255, 137, 6, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 30% 80%, rgba(242, 95, 76, 0.06) 0%, transparent 40%)
                    `,
                }}
            />
            <div className="container relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left">
                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff8906] text-white">
                            <Users className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-[#ff8906]">4,000+</div>
                            <div className="text-muted-foreground font-medium">Salseros en nuestra comunidad</div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <p className="text-lg text-muted-foreground max-w-xs">
                            Únete a nuestra familia en Facebook
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
                        >
                            <Link href="#" target="_blank" rel="noopener noreferrer">
                                <Facebook className="mr-2 h-5 w-5" />
                                Únete al Grupo
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

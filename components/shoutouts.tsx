import { Card, CardContent } from '@/components/ui/card'

type Shoutout = {
    name: string
    location: string
    dedication: string
}

const shoutouts: Shoutout[] = [
    {
        name: 'María González',
        location: 'Medellín, Colombia',
        dedication: 'Para mi esposo Carlos en nuestro aniversario. Te amo con toda mi alma.',
    },
    {
        name: 'Roberto Martínez',
        location: 'Bogotá, Colombia',
        dedication: 'Saludos a toda mi familia en Cali. Los extraño mucho.',
    },
    {
        name: 'Ana Rodríguez',
        location: 'Miami, USA',
        dedication: 'Para mi mamá en Colombia. Gracias por todo tu amor.',
    },
    {
        name: 'Carlos Pérez',
        location: 'Lima, Perú',
        dedication: 'Saludos a todos los salseros en Perú. Sigan bailando.',
    },
    {
        name: 'Laura Sánchez',
        location: 'Caracas, Venezuela',
        dedication: 'Para mi mejor amiga en su cumpleaños. Te quiero mucho.',
    },
    {
        name: 'José Fernández',
        location: 'Guayaquil, Ecuador',
        dedication: 'Para mi abuela que me enseñó a amar la salsa.',
    },
]

export function ShoutoutsSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold">Dedicatorias y Saludos</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Mensajes de nuestros oyentes para sus seres queridos
                    </p>
                </div>

                {/* Mobile: 2-row horizontal scroll */}
                <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {shoutouts.map(({ name, location, dedication }, index) => (
                            <Card key={index} className="flex-shrink-0 w-72 border-l-4 border-l-[#ff8906] snap-start">
                                <CardContent className="pt-5 pb-4">
                                    <blockquote className="italic text-muted-foreground mb-3 text-sm">
                                        "{dedication}"
                                    </blockquote>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-[#ff8906]">{name}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground text-xs">{location}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Desktop: 3-column grid */}
                <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shoutouts.map(({ name, location, dedication }, index) => (
                        <Card key={index} className="border-l-4 border-l-[#ff8906]">
                            <CardContent className="pt-5 pb-4">
                                <blockquote className="italic text-muted-foreground mb-3">
                                    "{dedication}"
                                </blockquote>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-[#ff8906]">{name}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">{location}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

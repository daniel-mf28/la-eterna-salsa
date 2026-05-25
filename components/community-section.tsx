import Link from 'next/link'

function FacebookLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.079 1.372.157v3.311a8 8 0 0 0-.855-.036c-1.213 0-1.683.461-1.683 1.66v2.466h4.345l-.746 3.668h-3.6v8.127A9.935 9.935 0 0 0 22 12.07C22 6.543 17.523 2.07 12 2.07S2 6.543 2 12.07c0 5.013 3.657 9.167 8.437 9.93a10 10 0 0 0 .664.078z" />
        </svg>
    )
}

export function CommunitySection() {
    return (
        <section className="w-full px-4 md:px-6">
            <div className="max-w-[1398px] mx-auto">
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Background image + teal overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/fb-banner-bg.png')" }}
                    />
                    <div className="absolute inset-0 bg-[#0A3538]/72" />

                    {/* Content — design: height ~265px, centered, gap 40, padding 0 100 */}
                    <div
                        className="relative z-10 flex flex-col md:flex-row items-center justify-center py-8 md:py-0 px-5 md:px-[100px] gap-6 md:gap-10"
                        style={{ minHeight: 200 }}
                    >
                        {/* FB icon in cream circle */}
                        <div className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-full bg-[#FCEED8] flex items-center justify-center flex-shrink-0">
                            <FacebookLogo className="w-10 h-10 md:w-16 md:h-16 text-[#0A3538]" />
                        </div>

                        {/* Text */}
                        <div className="text-center md:text-left">
                            <h2
                                className="font-serif text-[#FCEED8] uppercase text-[22px] md:text-[36px]"
                                style={{ fontWeight: 700, letterSpacing: 2 }}
                            >
                                Síguenos en Facebook
                            </h2>
                            <div className="w-[60px] h-[3px] bg-[#E58143] mx-auto md:mx-0 my-3" />
                            <p className="font-serif text-[16px] md:text-[20px] text-white/80" style={{ maxWidth: 300 }}>
                                Únete a 4000+ salseros en nuestra comunidad
                            </p>
                        </div>

                        {/* Button */}
                        <Link
                            href="https://www.facebook.com/groups/474578099219530/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 font-sans font-bold text-white bg-[#0A3538] border-2 border-white rounded-xl uppercase hover:bg-[#0A3538]/80 transition-colors text-[14px] md:text-[16px] px-6 py-3 md:px-9 md:py-4"
                            style={{ letterSpacing: 2 }}
                        >
                            Ir a Facebook
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

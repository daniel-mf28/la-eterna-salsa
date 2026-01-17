"use client"

import Image from 'next/image'
import { Music, Radio, Disc3 } from 'lucide-react'
import { useNowPlaying } from '@/lib/now-playing-context'
import { useDragScroll } from '@/lib/use-drag-scroll'

export function RecentSongsSection() {
    const { currentSong, recentSongs, isLive, isLoading } = useNowPlaying()
    const scrollRef = useDragScroll<HTMLDivElement>()

    return (
        <section className="py-8 md:py-12 relative z-10">
            <div className="container">
                {/* Now Playing Banner */}
                {currentSong && isLive && (
                    <div className="mb-6 bg-gradient-to-r from-brand-red/20 to-brand-gold/10 rounded-xl p-4 border border-brand-red/30">
                        <div className="flex items-center gap-4">
                            {/* Album Art or Spinning Disc */}
                            <div className="relative flex-shrink-0">
                                {currentSong.albumArt && currentSong.albumArt !== '/images/vinyl-placeholder.svg' ? (
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={currentSong.albumArt}
                                            alt={`${currentSong.title} album art`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <Disc3 className="h-16 w-16 md:h-20 md:w-20 text-brand-gold animate-spin" style={{ animationDuration: '3s' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-4 w-4 bg-brand-red rounded-full" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Radio className="h-4 w-4 text-brand-red" />
                                    <span className="text-sm font-medium text-brand-red uppercase tracking-wide">En Vivo Ahora</span>
                                </div>
                                <p className="font-bold text-lg truncate">{currentSong.title}</p>
                                <p className="text-muted-foreground truncate">{currentSong.artist}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                    <Music className="h-5 w-5 text-brand-orange" />
                    <h2 className="text-lg font-semibold">
                        {isLive ? 'Canciones Anteriores' : 'Canciones Recientes'}
                    </h2>
                    {!isLive && !isLoading && (
                        <span className="text-xs text-muted-foreground">(Demo)</span>
                    )}
                </div>

                {/* Horizontal scroll on mobile, grid on desktop */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:gap-3 hide-scrollbar"
                >
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-28 md:w-32 bg-card rounded-md overflow-hidden border border-border animate-pulse"
                            >
                                <div className="aspect-square bg-muted" />
                                <div className="p-2">
                                    <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
                                    <div className="h-2.5 bg-muted rounded w-1/2 mb-1.5" />
                                    <div className="h-2.5 bg-muted rounded w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : (
                        recentSongs.map((song, index) => (
                            <div
                                key={`${song.title}-${index}`}
                                className="flex-shrink-0 w-28 md:w-32 bg-card rounded-md overflow-hidden border border-border hover:border-brand-orange/50 transition-colors group"
                            >
                                {/* Album Art */}
                                <div className="relative aspect-square bg-muted">
                                    <Image
                                        src={song.albumArt || '/images/vinyl-placeholder.svg'}
                                        alt={`${song.title} album art`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 112px, 150px"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                {/* Song Info */}
                                <div className="p-2">
                                    <p className="font-medium text-xs truncate">{song.title}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{song.artist}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{song.playedAt}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}

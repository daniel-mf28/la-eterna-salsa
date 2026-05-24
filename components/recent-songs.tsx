"use client"

import Image from 'next/image'
import { useNowPlaying } from '@/lib/now-playing-context'

export function RecentSongsSection() {
    const { currentSong, recentSongs, isLive, isLoading } = useNowPlaying()

    const nowSong = currentSong && isLive ? currentSong : recentSongs[0] ?? null

    return (
        <section className="w-full relative z-10 px-4 md:px-6">
            <div className="max-w-[1398px] mx-auto">
                <div
                    className="rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center p-5 md:px-12 md:py-8"
                    style={{
                        background: "#FBF1E4",
                        gap: 24,
                        boxShadow: "0 4px 20px rgba(10, 53, 56, 0.15)",
                    }}
                >
                    {/* Left: Now Playing — 340px */}
                    <div className="w-full md:w-[340px] flex-shrink-0 min-w-0">
                        <h3
                            className="font-sans text-[#0E1817] uppercase mb-3"
                            style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}
                        >
                            Sonando Ahora
                        </h3>

                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="flex mb-3" style={{ width: 110, height: 90 }}>
                                    <div className="w-[72px] h-[72px] rounded-md bg-[#C7C0AF]/30" />
                                </div>
                                <div className="h-6 bg-[#C7C0AF]/30 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-[#C7C0AF]/30 rounded w-1/2" />
                            </div>
                        ) : nowSong ? (
                            <div className="flex items-center gap-3">
                                {/* Album art — single, same size as recent grid */}
                                <div className="relative flex-shrink-0 w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-lg overflow-hidden bg-[#FAD09F]">
                                    <Image
                                        src={nowSong.albumArt || '/images/vinyl-placeholder.svg'}
                                        alt={nowSong.title}
                                        fill
                                        className="object-cover"
                                        sizes="120px"
                                    />
                                </div>

                                {/* Song info */}
                                <div className="min-w-0">
                                    <p
                                        className="font-[family-name:var(--font-playfair)] text-[#0E1817] leading-tight truncate"
                                        style={{ fontSize: 24, fontWeight: 700 }}
                                    >
                                        {nowSong.title}
                                    </p>
                                    <p className="font-sans text-[14px] text-[#5B7368] truncate mt-1">
                                        {nowSong.artist}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px self-stretch bg-[#C7C0AF]/30" />
                    <div className="block md:hidden w-full h-px bg-[#C7C0AF]/30" />

                    {/* Right: Recent Songs — fills remaining */}
                    <div className="flex-1 min-w-0 w-full">
                        <h3
                            className="font-sans text-[#0E1817] uppercase mb-3"
                            style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}
                        >
                            Recién Sonó
                        </h3>

                        {isLoading ? (
                            <div className="flex gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex-1 min-w-0 animate-pulse">
                                        <div className="aspect-square rounded-lg bg-[#C7C0AF]/30 mb-2" />
                                        <div className="h-3 bg-[#C7C0AF]/30 rounded w-3/4 mb-1" />
                                        <div className="h-3 bg-[#C7C0AF]/30 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                                {recentSongs.slice(0, 5).map((song, index) => (
                                    <div
                                        key={`${song.title}-${index}`}
                                        className="flex-shrink-0 w-[80px] md:w-[120px]"
                                    >
                                        <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden bg-[#FAD09F]">
                                            <Image
                                                src={song.albumArt || '/images/vinyl-placeholder.svg'}
                                                alt={`${song.title} - ${song.artist}`}
                                                fill
                                                className="object-cover"
                                                sizes="120px"
                                            />
                                        </div>
                                        <p
                                            className="font-sans text-[#0E1817] truncate mt-2"
                                            style={{ fontSize: 12, fontWeight: 700 }}
                                        >
                                            {song.title}
                                        </p>
                                        <p className="font-sans text-[11px] text-[#5B7368] truncate">
                                            {song.artist}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

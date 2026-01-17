/**
 * Seed All Mock Data Script
 *
 * This script populates all mock data for La Eterna Salsa including:
 * - DJs (from dj-team.tsx fallback data)
 * - Shoutouts (from shoutouts-carousel.tsx fallback data)
 * - Platform Links (from listen-platforms.tsx fallback data)
 * - Chat Messages (sample messages)
 * - Spotify Playlist (site_config)
 * - Stickers (emoji stickers)
 *
 * Usage:
 *   npm run seed:all
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// Default DJs from dj-team.tsx
const DEFAULT_DJS = [
  {
    name: 'DJ Clásico',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clasico',
    schedule: 'Lunes a Viernes, 6 AM - 12 PM',
    bio: 'Experto en salsa de la vieja escuela y ritmos tradicionales.',
    social_links: { instagram: 'djclasico', twitter: 'djclasico' },
    display_order: 1
  },
  {
    name: 'DJ Brava',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brava',
    schedule: 'Lunes a Viernes, 12 PM - 6 PM',
    bio: 'Especialista en salsa dura y los mejores éxitos de Nueva York.',
    social_links: { instagram: 'djbrava', twitter: 'djbrava' },
    display_order: 2
  },
  {
    name: 'DJ Nocturno',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nocturno',
    schedule: 'Todos los días, 6 PM - 12 AM',
    bio: 'Tus noches de salsa romántica y clásicos inolvidables.',
    social_links: { instagram: 'djnocturno', twitter: 'djnocturno' },
    display_order: 3
  }
]

// Default shoutouts from shoutouts-carousel.tsx
const DEFAULT_SHOUTOUTS = [
  {
    name: 'Carlos Rodriguez',
    city: 'Cali',
    country: 'Colombia',
    message: '¡Saludos a toda mi familia en Cali! Que viva la salsa y que viva La Eterna!',
    song_request: 'El Cantante - Héctor Lavoe',
    approved: true
  },
  {
    name: 'Maria Gonzalez',
    city: 'Medellín',
    country: 'Colombia',
    message: 'Un abrazo grande desde Medellín para todos los salseros del mundo. Esta emisora es lo máximo!',
    song_request: 'Rebelión - Joe Arroyo',
    approved: true
  },
  {
    name: 'Roberto Martinez',
    city: 'Miami',
    country: 'USA',
    message: 'The best salsa station! Greetings from Miami to all salsa lovers!',
    song_request: 'Quimbara - Celia Cruz',
    approved: true
  }
]

// Default platform links from listen-platforms.tsx
const DEFAULT_PLATFORMS = [
  {
    name: 'TuneIn',
    url: 'https://tunein.com/radio/La-Eterna-Salsa-s123456/',
    icon: 'radio',
    display_order: 1
  },
  {
    name: 'Radio.net',
    url: 'https://www.radio.net/s/laeternasalsa',
    icon: 'music',
    display_order: 2
  },
  {
    name: 'Reproductor Web',
    url: '/listen',
    icon: 'headphones',
    display_order: 3
  }
]

// Sample chat messages
const DEFAULT_CHAT_MESSAGES = [
  { username: 'Juan', message: '¡Qué buena música! 🎵' },
  { username: 'Maria', message: 'Saludos desde Cali!' },
  { username: 'Pedro', message: 'Esta canción es mi favorita ❤️' },
  { username: 'Ana', message: '¡Viva la salsa!' },
  { username: 'Carlos', message: 'Excelente selección DJ! 🔥' }
]

// Default stickers from seed-stickers.ts
const DEFAULT_STICKERS = [
  { name: 'Dancing', image_url: 'https://em-content.zobj.net/source/apple/354/woman-dancing_1f483.png' },
  { name: 'Fire', image_url: 'https://em-content.zobj.net/source/apple/354/fire_1f525.png' },
  { name: 'Heart Eyes', image_url: 'https://em-content.zobj.net/source/apple/354/smiling-face-with-heart-eyes_1f60d.png' },
  { name: 'Clapping', image_url: 'https://em-content.zobj.net/source/apple/354/clapping-hands_1f44f.png' },
  { name: 'Party Popper', image_url: 'https://em-content.zobj.net/source/apple/354/party-popper_1f389.png' },
  { name: 'Musical Notes', image_url: 'https://em-content.zobj.net/source/apple/354/musical-notes_1f3b6.png' },
  { name: 'Star Struck', image_url: 'https://em-content.zobj.net/source/apple/354/star-struck_1f929.png' },
  { name: 'Heart', image_url: 'https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png' },
  { name: 'Thumbs Up', image_url: 'https://em-content.zobj.net/source/apple/354/thumbs-up_1f44d.png' },
  { name: 'Sparkling Heart', image_url: 'https://em-content.zobj.net/source/apple/354/sparkling-heart_1f496.png' },
  { name: 'Raising Hands', image_url: 'https://em-content.zobj.net/source/apple/354/person-raising-both-hands-in-celebration_1f64c.png' },
  { name: 'Salsa Dancer', image_url: 'https://em-content.zobj.net/source/apple/354/man-dancing_1f57a.png' },
  { name: 'Cool Sunglasses', image_url: 'https://em-content.zobj.net/source/apple/354/smiling-face-with-sunglasses_1f60e.png' },
  { name: 'Microphone', image_url: 'https://em-content.zobj.net/source/apple/354/microphone_1f3a4.png' },
  { name: 'Headphone', image_url: 'https://em-content.zobj.net/source/apple/354/headphone_1f3a7.png' },
  { name: 'Radio', image_url: 'https://em-content.zobj.net/source/apple/354/radio_1f4fb.png' },
  { name: 'Disco Ball', image_url: 'https://em-content.zobj.net/source/apple/354/mirror-ball_1faa9.png' },
  { name: 'Trumpet', image_url: 'https://em-content.zobj.net/source/apple/354/trumpet_1f3ba.png' },
  { name: 'Drum', image_url: 'https://em-content.zobj.net/source/apple/354/drum_1f941.png' },
  { name: 'Guitar', image_url: 'https://em-content.zobj.net/source/apple/354/guitar_1f3b8.png' }
]

async function seedAll() {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing required environment variables')
    console.error('Please set:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🌟 Starting La Eterna Salsa database seeding...\n')

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // ========================================================================
    // 1. SEED STICKERS
    // ========================================================================
    console.log('🎨 Seeding stickers...')
    const { data: existingStickers } = await supabase
      .from('stickers')
      .select('image_url')

    const existingStickerUrls = new Set(existingStickers?.map(s => s.image_url) || [])
    const stickersToAdd = DEFAULT_STICKERS.filter(s => !existingStickerUrls.has(s.image_url))

    if (stickersToAdd.length > 0) {
      const { error } = await supabase.from('stickers').insert(stickersToAdd)
      if (error) throw new Error(`Stickers: ${error.message}`)
      console.log(`   ✅ Added ${stickersToAdd.length} stickers`)
    } else {
      console.log(`   ✅ All stickers already exist (${existingStickerUrls.size} total)`)
    }

    // ========================================================================
    // 2. SEED DJs
    // ========================================================================
    console.log('\n👨‍🎤 Seeding DJs...')
    const { data: existingDJs } = await supabase
      .from('djs')
      .select('name')

    const existingDJNames = new Set(existingDJs?.map(d => d.name) || [])
    const djsToAdd = DEFAULT_DJS.filter(d => !existingDJNames.has(d.name))

    if (djsToAdd.length > 0) {
      const { error } = await supabase.from('djs').insert(djsToAdd)
      if (error) throw new Error(`DJs: ${error.message}`)
      console.log(`   ✅ Added ${djsToAdd.length} DJs`)
    } else {
      console.log(`   ✅ All DJs already exist (${existingDJNames.size} total)`)
    }

    // ========================================================================
    // 3. SEED SHOUTOUTS
    // ========================================================================
    console.log('\n📣 Seeding shoutouts...')
    const { data: existingShoutouts } = await supabase
      .from('shoutouts')
      .select('name, city')

    const existingShoutoutKeys = new Set(
      existingShoutouts?.map(s => `${s.name}|${s.city}`) || []
    )
    const shoutoutsToAdd = DEFAULT_SHOUTOUTS.filter(
      s => !existingShoutoutKeys.has(`${s.name}|${s.city}`)
    )

    if (shoutoutsToAdd.length > 0) {
      const { error } = await supabase.from('shoutouts').insert(shoutoutsToAdd)
      if (error) throw new Error(`Shoutouts: ${error.message}`)
      console.log(`   ✅ Added ${shoutoutsToAdd.length} shoutouts`)
    } else {
      console.log(`   ✅ All shoutouts already exist (${existingShoutoutKeys.size} total)`)
    }

    // ========================================================================
    // 4. SEED PLATFORM LINKS
    // ========================================================================
    console.log('\n🔗 Seeding platform links...')
    const { data: existingPlatforms } = await supabase
      .from('platform_links')
      .select('name')

    const existingPlatformNames = new Set(existingPlatforms?.map(p => p.name) || [])
    const platformsToAdd = DEFAULT_PLATFORMS.filter(p => !existingPlatformNames.has(p.name))

    if (platformsToAdd.length > 0) {
      const { error } = await supabase.from('platform_links').insert(platformsToAdd)
      if (error) throw new Error(`Platform links: ${error.message}`)
      console.log(`   ✅ Added ${platformsToAdd.length} platform links`)
    } else {
      console.log(`   ✅ All platform links already exist (${existingPlatformNames.size} total)`)
    }

    // ========================================================================
    // 5. SEED CHAT MESSAGES
    // ========================================================================
    console.log('\n💬 Seeding chat messages...')
    const { count: chatCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    if (chatCount === 0) {
      const { error } = await supabase.from('chat_messages').insert(DEFAULT_CHAT_MESSAGES)
      if (error) throw new Error(`Chat messages: ${error.message}`)
      console.log(`   ✅ Added ${DEFAULT_CHAT_MESSAGES.length} chat messages`)
    } else {
      console.log(`   ✅ Chat already has messages (${chatCount} total)`)
    }

    // ========================================================================
    // 6. SEED SPOTIFY PLAYLIST (site_config)
    // ========================================================================
    console.log('\n🎵 Seeding Spotify playlist config...')
    const { error: spotifyError } = await supabase
      .from('site_config')
      .upsert({
        key: 'spotify_playlist_id',
        value: '37i9dQZF1DX8XcRJigLxsW' // Salsa playlist
      })

    if (spotifyError) throw new Error(`Spotify config: ${spotifyError.message}`)
    console.log('   ✅ Spotify playlist configured')

    // ========================================================================
    // 7. SEED STREAM URL (site_config)
    // ========================================================================
    console.log('\n📻 Seeding stream URL config...')
    const { error: streamError } = await supabase
      .from('site_config')
      .upsert({
        key: 'stream_url',
        value: 'https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream'
      })

    if (streamError) throw new Error(`Stream URL config: ${streamError.message}`)
    console.log('   ✅ Stream URL configured (Centova Cast)')

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(60))
    console.log('🎉 DATABASE SEEDING COMPLETE!')
    console.log('='.repeat(60))

    const counts = await Promise.all([
      supabase.from('stickers').select('*', { count: 'exact', head: true }),
      supabase.from('djs').select('*', { count: 'exact', head: true }),
      supabase.from('shoutouts').select('*', { count: 'exact', head: true }),
      supabase.from('platform_links').select('*', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
      supabase.from('site_config').select('*', { count: 'exact', head: true })
    ])

    console.log('\n📊 Database Summary:')
    console.log(`   • Stickers:       ${counts[0].count} records`)
    console.log(`   • DJs:            ${counts[1].count} records`)
    console.log(`   • Shoutouts:      ${counts[2].count} records`)
    console.log(`   • Platform Links: ${counts[3].count} records`)
    console.log(`   • Chat Messages:  ${counts[4].count} records`)
    console.log(`   • Site Config:    ${counts[5].count} records`)
    console.log('\n✨ Your homepage and admin panel are now populated!\n')

  } catch (error) {
    console.error('\n❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the script
seedAll()

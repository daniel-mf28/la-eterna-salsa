/**
 * Seed Default Emoji Stickers Script
 *
 * This script adds the default emoji stickers from em-content.zobj.net
 * to the stickers table in the database.
 *
 * Usage:
 *   npx tsx scripts/seed-stickers.ts
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// Default emoji stickers from em-content.zobj.net
const DEFAULT_STICKERS = [
  {
    name: 'Dancing',
    image_url: 'https://em-content.zobj.net/source/apple/354/woman-dancing_1f483.png'
  },
  {
    name: 'Fire',
    image_url: 'https://em-content.zobj.net/source/apple/354/fire_1f525.png'
  },
  {
    name: 'Heart Eyes',
    image_url: 'https://em-content.zobj.net/source/apple/354/smiling-face-with-heart-eyes_1f60d.png'
  },
  {
    name: 'Clapping',
    image_url: 'https://em-content.zobj.net/source/apple/354/clapping-hands_1f44f.png'
  },
  {
    name: 'Party Popper',
    image_url: 'https://em-content.zobj.net/source/apple/354/party-popper_1f389.png'
  },
  {
    name: 'Musical Notes',
    image_url: 'https://em-content.zobj.net/source/apple/354/musical-notes_1f3b6.png'
  },
  {
    name: 'Star Struck',
    image_url: 'https://em-content.zobj.net/source/apple/354/star-struck_1f929.png'
  },
  {
    name: 'Heart',
    image_url: 'https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png'
  },
  {
    name: 'Thumbs Up',
    image_url: 'https://em-content.zobj.net/source/apple/354/thumbs-up_1f44d.png'
  },
  {
    name: 'Sparkling Heart',
    image_url: 'https://em-content.zobj.net/source/apple/354/sparkling-heart_1f496.png'
  },
  {
    name: 'Raising Hands',
    image_url: 'https://em-content.zobj.net/source/apple/354/person-raising-both-hands-in-celebration_1f64c.png'
  },
  {
    name: 'Salsa Dancer',
    image_url: 'https://em-content.zobj.net/source/apple/354/man-dancing_1f57a.png'
  },
  {
    name: 'Cool Sunglasses',
    image_url: 'https://em-content.zobj.net/source/apple/354/smiling-face-with-sunglasses_1f60e.png'
  },
  {
    name: 'Microphone',
    image_url: 'https://em-content.zobj.net/source/apple/354/microphone_1f3a4.png'
  },
  {
    name: 'Headphone',
    image_url: 'https://em-content.zobj.net/source/apple/354/headphone_1f3a7.png'
  },
  {
    name: 'Radio',
    image_url: 'https://em-content.zobj.net/source/apple/354/radio_1f4fb.png'
  },
  {
    name: 'Disco Ball',
    image_url: 'https://em-content.zobj.net/source/apple/354/mirror-ball_1faa9.png'
  },
  {
    name: 'Trumpet',
    image_url: 'https://em-content.zobj.net/source/apple/354/trumpet_1f3ba.png'
  },
  {
    name: 'Drum',
    image_url: 'https://em-content.zobj.net/source/apple/354/drum_1f941.png'
  },
  {
    name: 'Guitar',
    image_url: 'https://em-content.zobj.net/source/apple/354/guitar_1f3b8.png'
  }
]

async function seedStickers() {
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

  console.log('🎨 Starting sticker seeding process...\n')

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
    // Check for existing stickers
    const { data: existingStickers, error: fetchError } = await supabase
      .from('stickers')
      .select('image_url')

    if (fetchError) {
      throw new Error(`Failed to check existing stickers: ${fetchError.message}`)
    }

    const existingUrls = new Set(existingStickers?.map((s: any) => s.image_url) || [])
    console.log(`📊 Found ${existingUrls.size} existing stickers in database`)

    // Filter out stickers that already exist
    const stickersToAdd = DEFAULT_STICKERS.filter(
      sticker => !existingUrls.has(sticker.image_url)
    )

    if (stickersToAdd.length === 0) {
      console.log('\n✅ All default stickers already exist in the database!')
      console.log(`Total stickers: ${existingUrls.size}`)
      return
    }

    console.log(`\n➕ Adding ${stickersToAdd.length} new stickers...\n`)

    // Insert new stickers
    const { data: insertedStickers, error: insertError } = await supabase
      .from('stickers')
      .insert(stickersToAdd as any)
      .select()

    if (insertError) {
      throw new Error(`Failed to insert stickers: ${insertError.message}`)
    }

    // Display results
    console.log('✅ Successfully added stickers:\n')
    insertedStickers?.forEach((sticker: any, index) => {
      console.log(`   ${index + 1}. ${sticker.name}`)
    })

    const totalCount = existingUrls.size + (insertedStickers?.length || 0)
    console.log(`\n🎉 Done! Total stickers in database: ${totalCount}`)

  } catch (error) {
    console.error('\n❌ Error seeding stickers:', error)
    process.exit(1)
  }
}

// Run the script
seedStickers()

# Database Scripts

This directory contains utility scripts for managing the La Eterna Salsa database.

## Sticker Seeding

There are two ways to add the default emoji stickers to your database:

### Option 1: TypeScript Script (Recommended)

Run the TypeScript script using npm:

```bash
# Install dependencies (includes tsx)
npm install

# Run the seed script
npm run seed:stickers
```

Or run directly with npx:

```bash
npx tsx scripts/seed-stickers.ts
```

**Requirements:**
- `NEXT_PUBLIC_SUPABASE_URL` environment variable
- `SUPABASE_SERVICE_ROLE_KEY` environment variable

**Features:**
- Checks for existing stickers to avoid duplicates
- Shows progress and results
- Safe to run multiple times

### Option 2: SQL Migration

Run the SQL file directly in the Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase/seed-stickers.sql`
4. Paste and execute

**Or** run via command line if you have direct database access:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/seed-stickers.sql
```

## Default Stickers

The seed script adds 20 default emoji stickers from em-content.zobj.net:

- Dancing (woman-dancing)
- Fire
- Heart Eyes
- Clapping
- Party Popper
- Musical Notes
- Star Struck
- Heart
- Thumbs Up
- Sparkling Heart
- Raising Hands
- Salsa Dancer (man-dancing)
- Cool Sunglasses
- Microphone
- Headphone
- Radio
- Disco Ball
- Trumpet
- Drum
- Guitar

All emojis are from Apple's emoji set and are perfect for a salsa radio station chat!

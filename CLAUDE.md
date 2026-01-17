# La Eterna Salsa - AI Agent Context

## Stack
Next.js 16, Supabase, shadcn/ui, Tailwind v4, TypeScript

## Commands
```bash
npm run dev      # Development
npm run build    # Build (verify before commit)
```

## Key Files
```
lib/supabase.ts          # Browser client (placeholder values for build)
lib/supabase-server.ts   # Server client + service role
lib/database.types.ts    # Generated types from schema
supabase/schema.sql      # Full database schema
middleware.ts            # Admin auth protection
```

## Routes
- `/` - Homepage (radio player + chat)
- `/video` - YouTube playlist page
- `/shoutout` - Submit shoutout form
- `/admin/*` - Protected admin panel (10 sections)

## Database Tables
`chat_messages`, `shoutouts`, `stickers`, `site_config`, `djs`, `faqs`, `platform_links`, `social_links`, `admin_emails`

## Components
```
components/
├── radio-player.tsx      # Vinyl-style player, huge play button
├── chat-widget.tsx       # Real-time chat, GIFs, stickers, view-only for guests
├── recent-songs.tsx      # Shoutcast metadata polling (45s interval)
├── shoutouts-carousel.tsx
├── giphy-picker.tsx
├── sticker-picker.tsx
└── ui/                   # shadcn components
```

## Build Notes
- Admin pages use `// @ts-nocheck` (Supabase types need env vars)
- Supabase clients have placeholder values for static builds
- PWA icons at `/public/icons/`

## Colors
```css
--brand-red: #D32F2F
--brand-gold: #FBC000
--brand-orange: #ff8906
```

## Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GIPHY_API_KEY
NEXT_PUBLIC_SHOUTCAST_URL (optional - for live metadata)
```

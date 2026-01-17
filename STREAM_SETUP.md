# Stream Setup Guide for La Eterna Salsa

## Overview
Your Centova Cast radio stream has been integrated into the La Eterna Salsa website. This guide explains the configuration.

## Stream URLs

### Main Stream URL (Used by the Radio Player)
```
https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream
```
This is the primary streaming URL that plays audio in the browser.

### Alternative Stream Formats
- **Winamp/iTunes:** https://solid24.streamupsolutions.com/tunein/cotbkmmk.pls
- **Windows Media Player:** https://solid24.streamupsolutions.com/tunein/cotbkmmk.asx
- **Real Player:** https://solid24.streamupsolutions.com/tunein/cotbkmmk.ram
- **QuickTime:** https://solid24.streamupsolutions.com/tunein/cotbkmmk.qtl
- **Stream Proxy:** https://solid24.streamupsolutions.com/stream/cotbkmmk/stream.pls

### Centova Cast Admin URLs
- **Start Page:** https://solid24.streamupsolutions.com/start/cotbkmmk
- **Server Index:** http://solid24.streamupsolutions.com:8066/index.html
- **Statistics API:** http://solid24.streamupsolutions.com:8066/statistics?json=1

## Configuration Steps

### 1. Database Setup (Stream URL)

The stream URL is already configured in the seed file. Run this in Supabase SQL Editor:

```sql
INSERT INTO site_config (key, value)
VALUES ('stream_url', 'https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Or simply run the complete seed file: [supabase/seed-all-data.sql](supabase/seed-all-data.sql)

### 2. Environment Variables (Now Playing Metadata)

Add this to your `.env.local` file to enable "Now Playing" metadata:

```bash
# Centova Cast metadata URL for "Now Playing" display
NEXT_PUBLIC_SHOUTCAST_URL=http://solid24.streamupsolutions.com:8066
```

**Note:** This is optional. If not set, the website will display fallback songs.

### 3. How It Works

#### Audio Streaming
1. User clicks play button on homepage
2. `HeroSection` component fetches stream URL from `site_config` table
3. `RadioPlayer` component loads and plays the stream
4. Audio plays via HTML5 `<audio>` element

#### Now Playing Metadata
1. `NowPlayingProvider` polls the Centova Cast API every 45 seconds
2. Fetches current song from: `http://solid24.streamupsolutions.com:8066/statistics?json=1`
3. Parses song title (format: "Artist - Song Title")
4. Fetches album art from Spotify API
5. Displays current song and recent playlist

## Admin Panel Management

You can change the stream URL anytime through the admin panel:

1. Go to: `/admin/stream`
2. Update "Stream URL" field
3. Click "Save Settings"

## Troubleshooting

### Stream Won't Play
- Check that the stream URL in `site_config` is correct
- Verify the Centova Cast stream is running
- Check browser console for CORS or network errors
- Ensure HTTPS proxy URL is used (not HTTP)

### No "Now Playing" Metadata
- Check that `NEXT_PUBLIC_SHOUTCAST_URL` is set in `.env.local`
- Verify the statistics endpoint returns JSON: http://solid24.streamupsolutions.com:8066/statistics?json=1
- Check browser console for CORS errors
- Ensure the Centova Cast server allows cross-origin requests

### CORS Issues
If you get CORS errors when fetching metadata, you may need to:
1. Configure CORS headers in Centova Cast
2. Use a proxy server
3. Or disable metadata and use fallback songs

## Testing

1. **Test Stream Playback:**
   - Visit homepage
   - Click the vinyl record play button
   - Verify audio plays

2. **Test Now Playing:**
   - Check if current song displays on homepage
   - Verify recent songs list updates
   - Check if album art loads

3. **Test Admin Panel:**
   - Login to `/admin`
   - Go to Stream Settings
   - Change stream URL
   - Verify changes reflect on homepage

## Files Modified

- [components/hero-section.tsx](components/hero-section.tsx) - Fetches stream URL from database
- [components/radio-player.tsx](components/radio-player.tsx) - Plays audio stream
- [lib/now-playing-context.tsx](lib/now-playing-context.tsx) - Fetches metadata
- [supabase/seed-all-data.sql](supabase/seed-all-data.sql) - Seeds stream URL
- [scripts/seed-all.ts](scripts/seed-all.ts) - TypeScript seed script
- [.env.example](.env.example) - Documents environment variables

## Support

For issues with:
- **Centova Cast:** Contact Stream Up Solutions support
- **Website Integration:** Check browser console and verify configuration
- **Database:** Check Supabase dashboard and verify `site_config` table

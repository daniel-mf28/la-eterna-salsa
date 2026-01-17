# La Eterna Salsa - Setup Guide

## Prerequisites
- [ ] Node.js 18+
- [ ] Supabase account (free at supabase.com)
- [ ] GIPHY API key (free at developers.giphy.com)
- [ ] Your Shoutcast stream URL

---

## 1. Supabase Setup

### Create Project
- [ ] Go to supabase.com and sign in
- [ ] Click "New Project" → name it "la-eterna-salsa"
- [ ] Set database password (save this!)
- [ ] Select region close to your audience
- [ ] Wait ~2 minutes for creation

### Run Database Schema
- [ ] In Supabase → SQL Editor → New Query
- [ ] Copy contents of `supabase/schema.sql`
- [ ] Paste and click "Run"
- [ ] Should see "Success. No rows returned"

### Get API Keys
- [ ] Go to Settings → API
- [ ] Copy **Project URL** (https://xxxxx.supabase.co)
- [ ] Copy **Publishable** key
- [ ] Copy **Secret** key (click "Reveal")

### Add First Admin
- [ ] In SQL Editor, run:
```sql
INSERT INTO admin_emails (email) VALUES ('your-email@example.com');
```

---

## 2. GIPHY Setup
- [ ] Go to developers.giphy.com
- [ ] Create an app → Choose "API"
- [ ] Copy the API Key

---

## 3. Environment Variables

Create `.env.local` in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
NEXT_PUBLIC_GIPHY_API_KEY=your-giphy-key
NEXT_PUBLIC_SHOUTCAST_URL=http://your-shoutcast:port
```

---

## 4. Test Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Test Checklist
- [ ] Radio player plays audio
- [ ] Chat shows messages (can view without login)
- [ ] Can join chat and send messages
- [ ] GIFs and stickers work
- [ ] Shoutout form at /shoutout works
- [ ] Admin login at /admin/login works (magic link)
- [ ] PWA installs on phone

---

## 5. Configure Content (Admin Panel)

After logging in to `/admin`:
- [ ] `/admin/stream` - Set stream URL, Spotify/YouTube playlist IDs
- [ ] `/admin/platforms` - Add TuneIn, radio.net links
- [ ] `/admin/social` - Add Facebook, Instagram, YouTube
- [ ] `/admin/djs` - Add DJ profiles with photos
- [ ] `/admin/faqs` - Add FAQs

---

## 6. Deploy to Vercel

- [ ] Push to GitHub
- [ ] Import repo at vercel.com
- [ ] Add all environment variables
- [ ] Deploy

---

## Troubleshooting

**Can't log in?**
- Check email is in `admin_emails` table
- Check spam folder for magic link

**Chat not loading?**
- Verify Supabase credentials in .env.local
- Run schema.sql again if RLS issues

**Build errors?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| `/` | Homepage with radio player |
| `/video` | YouTube video page |
| `/shoutout` | Submit a shoutout |
| `/admin` | Admin dashboard |

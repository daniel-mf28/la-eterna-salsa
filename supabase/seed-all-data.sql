-- Seed All Mock Data for La Eterna Salsa
--
-- This script populates all mock data including:
-- - Stickers (emoji stickers for chat)
-- - DJs (from dj-team.tsx fallback data)
-- - Shoutouts (from shoutouts-carousel.tsx fallback data)
-- - Platform Links (from listen-platforms.tsx fallback data)
-- - Chat Messages (sample messages)
-- - Spotify Playlist (site_config)
--
-- Usage:
--   Run this in the Supabase SQL Editor
--   Copy and paste the entire file, then click "Run"

-- ============================================================================
-- 1. SEED STICKERS
-- ============================================================================
INSERT INTO stickers (name, image_url)
SELECT name, image_url FROM (VALUES
  ('Dancing', 'https://em-content.zobj.net/source/apple/354/woman-dancing_1f483.png'),
  ('Fire', 'https://em-content.zobj.net/source/apple/354/fire_1f525.png'),
  ('Heart Eyes', 'https://em-content.zobj.net/source/apple/354/smiling-face-with-heart-eyes_1f60d.png'),
  ('Clapping', 'https://em-content.zobj.net/source/apple/354/clapping-hands_1f44f.png'),
  ('Party Popper', 'https://em-content.zobj.net/source/apple/354/party-popper_1f389.png'),
  ('Musical Notes', 'https://em-content.zobj.net/source/apple/354/musical-notes_1f3b6.png'),
  ('Star Struck', 'https://em-content.zobj.net/source/apple/354/star-struck_1f929.png'),
  ('Heart', 'https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png'),
  ('Thumbs Up', 'https://em-content.zobj.net/source/apple/354/thumbs-up_1f44d.png'),
  ('Sparkling Heart', 'https://em-content.zobj.net/source/apple/354/sparkling-heart_1f496.png'),
  ('Raising Hands', 'https://em-content.zobj.net/source/apple/354/person-raising-both-hands-in-celebration_1f64c.png'),
  ('Salsa Dancer', 'https://em-content.zobj.net/source/apple/354/man-dancing_1f57a.png'),
  ('Cool Sunglasses', 'https://em-content.zobj.net/source/apple/354/smiling-face-with-sunglasses_1f60e.png'),
  ('Microphone', 'https://em-content.zobj.net/source/apple/354/microphone_1f3a4.png'),
  ('Headphone', 'https://em-content.zobj.net/source/apple/354/headphone_1f3a7.png'),
  ('Radio', 'https://em-content.zobj.net/source/apple/354/radio_1f4fb.png'),
  ('Disco Ball', 'https://em-content.zobj.net/source/apple/354/mirror-ball_1faa9.png'),
  ('Trumpet', 'https://em-content.zobj.net/source/apple/354/trumpet_1f3ba.png'),
  ('Drum', 'https://em-content.zobj.net/source/apple/354/drum_1f941.png'),
  ('Guitar', 'https://em-content.zobj.net/source/apple/354/guitar_1f3b8.png')
) AS new_stickers(name, image_url)
WHERE NOT EXISTS (
  SELECT 1 FROM stickers WHERE stickers.image_url = new_stickers.image_url
);

-- ============================================================================
-- 2. SEED DJs
-- ============================================================================
INSERT INTO djs (name, photo_url, schedule, bio, social_links, display_order)
SELECT name, photo_url, schedule, bio, social_links::jsonb, display_order FROM (VALUES
  (
    'DJ Clásico',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=clasico',
    'Lunes a Viernes, 6 AM - 12 PM',
    'Experto en salsa de la vieja escuela y ritmos tradicionales.',
    '{"instagram": "djclasico", "twitter": "djclasico"}',
    1
  ),
  (
    'DJ Brava',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=brava',
    'Lunes a Viernes, 12 PM - 6 PM',
    'Especialista en salsa dura y los mejores éxitos de Nueva York.',
    '{"instagram": "djbrava", "twitter": "djbrava"}',
    2
  ),
  (
    'DJ Nocturno',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=nocturno',
    'Todos los días, 6 PM - 12 AM',
    'Tus noches de salsa romántica y clásicos inolvidables.',
    '{"instagram": "djnocturno", "twitter": "djnocturno"}',
    3
  )
) AS new_djs(name, photo_url, schedule, bio, social_links, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM djs WHERE djs.name = new_djs.name
);

-- ============================================================================
-- 2. SEED SHOUTOUTS
-- ============================================================================
INSERT INTO shoutouts (name, city, country, message, song_request, approved)
SELECT name, city, country, message, song_request, approved FROM (VALUES
  (
    'Carlos Rodriguez',
    'Cali',
    'Colombia',
    '¡Saludos a toda mi familia en Cali! Que viva la salsa y que viva La Eterna!',
    'El Cantante - Héctor Lavoe',
    true
  ),
  (
    'Maria Gonzalez',
    'Medellín',
    'Colombia',
    'Un abrazo grande desde Medellín para todos los salseros del mundo. Esta emisora es lo máximo!',
    'Rebelión - Joe Arroyo',
    true
  ),
  (
    'Roberto Martinez',
    'Miami',
    'USA',
    'The best salsa station! Greetings from Miami to all salsa lovers!',
    'Quimbara - Celia Cruz',
    true
  )
) AS new_shoutouts(name, city, country, message, song_request, approved)
WHERE NOT EXISTS (
  SELECT 1 FROM shoutouts WHERE shoutouts.name = new_shoutouts.name AND shoutouts.city = new_shoutouts.city
);

-- ============================================================================
-- 4. SEED PLATFORM LINKS
-- ============================================================================
INSERT INTO platform_links (name, url, icon, display_order)
SELECT name, url, icon, display_order FROM (VALUES
  (
    'TuneIn',
    'https://tunein.com/radio/La-Eterna-Salsa-s123456/',
    'radio',
    1
  ),
  (
    'Radio.net',
    'https://www.radio.net/s/laeternasalsa',
    'music',
    2
  ),
  (
    'Reproductor Web',
    '/listen',
    'headphones',
    3
  )
) AS new_platforms(name, url, icon, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM platform_links WHERE platform_links.name = new_platforms.name
);

-- ============================================================================
-- 5. SEED CHAT MESSAGES (Sample)
-- ============================================================================
INSERT INTO chat_messages (username, message)
SELECT username, message FROM (VALUES
  ('Juan', '¡Qué buena música! 🎵'),
  ('Maria', 'Saludos desde Cali!'),
  ('Pedro', 'Esta canción es mi favorita ❤️'),
  ('Ana', '¡Viva la salsa!'),
  ('Carlos', 'Excelente selección DJ! 🔥')
) AS new_messages(username, message)
WHERE NOT EXISTS (
  SELECT 1 FROM chat_messages LIMIT 1
);

-- ============================================================================
-- 6. SEED SPOTIFY PLAYLIST (Site Config)
-- ============================================================================
INSERT INTO site_config (key, value)
VALUES ('spotify_playlist_id', '37i9dQZF1DX8XcRJigLxsW')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- 7. SEED STREAM URL (Site Config)
-- ============================================================================
-- Using the Stream Proxy URL which provides the best compatibility
INSERT INTO site_config (key, value)
VALUES ('stream_url', 'https://solid24.streamupsolutions.com/proxy/cotbkmmk/stream')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE 'All mock data has been seeded successfully!';
  RAISE NOTICE 'DJs: % records', (SELECT COUNT(*) FROM djs);
  RAISE NOTICE 'Shoutouts: % records', (SELECT COUNT(*) FROM shoutouts);
  RAISE NOTICE 'Platform Links: % records', (SELECT COUNT(*) FROM platform_links);
  RAISE NOTICE 'Chat Messages: % records', (SELECT COUNT(*) FROM chat_messages);
  RAISE NOTICE 'Stickers: % records', (SELECT COUNT(*) FROM stickers);
  RAISE NOTICE 'Site Config: % records', (SELECT COUNT(*) FROM site_config);
END $$;

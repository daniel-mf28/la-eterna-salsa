-- Seed Default Emoji Stickers
--
-- This migration adds the default emoji stickers from em-content.zobj.net
-- to the stickers table. It uses INSERT ... ON CONFLICT DO NOTHING to avoid
-- duplicates if run multiple times.
--
-- Usage:
--   Run this in the Supabase SQL Editor or via:
--   psql -h your-db-host -U postgres -d postgres -f supabase/seed-stickers.sql

-- Insert default emoji stickers
-- Using INSERT with a subquery to avoid duplicates
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

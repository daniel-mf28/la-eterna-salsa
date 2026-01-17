-- La Eterna Salsa Radio Station Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  sticker_url TEXT,
  gif_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shoutouts Table
CREATE TABLE shoutouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  city TEXT,
  country TEXT,
  song_request TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stickers Table
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Configuration Table
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DJs Table
CREATE TABLE djs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT,
  schedule TEXT,
  bio TEXT,
  social_links JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Links Table (TuneIn, radio.net, etc.)
CREATE TABLE platform_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Links Table
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Emails Table
CREATE TABLE admin_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_shoutouts_approved ON shoutouts(approved, created_at DESC);
CREATE INDEX idx_shoutouts_created_at ON shoutouts(created_at DESC);
CREATE INDEX idx_djs_display_order ON djs(display_order);
CREATE INDEX idx_faqs_display_order ON faqs(display_order);
CREATE INDEX idx_platform_links_display_order ON platform_links(display_order);
CREATE INDEX idx_site_config_key ON site_config(key);
CREATE INDEX idx_admin_emails_email ON admin_emails(email);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoutouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE djs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Chat Messages Policies
-- Public can read all messages
CREATE POLICY "Public can read chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Public can insert messages
CREATE POLICY "Public can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can delete messages
CREATE POLICY "Admins can delete chat messages" ON chat_messages
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Shoutouts Policies
-- Public can read approved shoutouts
CREATE POLICY "Public can read approved shoutouts" ON shoutouts
  FOR SELECT USING (approved = true);

-- Public can insert shoutouts
CREATE POLICY "Public can insert shoutouts" ON shoutouts
  FOR INSERT WITH CHECK (true);

-- Admins can read all shoutouts
CREATE POLICY "Admins can read all shoutouts" ON shoutouts
  FOR SELECT USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admins can update shoutouts
CREATE POLICY "Admins can update shoutouts" ON shoutouts
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admins can delete shoutouts
CREATE POLICY "Admins can delete shoutouts" ON shoutouts
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Stickers Policies
-- Public can read stickers
CREATE POLICY "Public can read stickers" ON stickers
  FOR SELECT USING (true);

-- Admins can insert stickers
CREATE POLICY "Admins can insert stickers" ON stickers
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admins can update stickers
CREATE POLICY "Admins can update stickers" ON stickers
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admins can delete stickers
CREATE POLICY "Admins can delete stickers" ON stickers
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Site Config Policies
-- Public can read site config
CREATE POLICY "Public can read site config" ON site_config
  FOR SELECT USING (true);

-- Admins can insert site config
CREATE POLICY "Admins can insert site config" ON site_config
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admins can update site config
CREATE POLICY "Admins can update site config" ON site_config
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- DJs Policies
-- Public can read DJs
CREATE POLICY "Public can read DJs" ON djs
  FOR SELECT USING (true);

-- Admins can manage DJs
CREATE POLICY "Admins can insert DJs" ON djs
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update DJs" ON djs
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete DJs" ON djs
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- FAQs Policies
-- Public can read FAQs
CREATE POLICY "Public can read FAQs" ON faqs
  FOR SELECT USING (true);

-- Admins can manage FAQs
CREATE POLICY "Admins can insert FAQs" ON faqs
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update FAQs" ON faqs
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete FAQs" ON faqs
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Platform Links Policies
-- Public can read platform links
CREATE POLICY "Public can read platform links" ON platform_links
  FOR SELECT USING (true);

-- Admins can manage platform links
CREATE POLICY "Admins can insert platform links" ON platform_links
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update platform links" ON platform_links
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete platform links" ON platform_links
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Social Links Policies
-- Public can read social links
CREATE POLICY "Public can read social links" ON social_links
  FOR SELECT USING (true);

-- Admins can manage social links
CREATE POLICY "Admins can insert social links" ON social_links
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update social links" ON social_links
  FOR UPDATE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete social links" ON social_links
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Admin Emails Policies
-- Authenticated users can read admin emails (needed for login check)
CREATE POLICY "Authenticated users can read admin emails" ON admin_emails
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Only admins can insert admin emails
CREATE POLICY "Admins can insert admin emails" ON admin_emails
  FOR INSERT WITH CHECK (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can delete admin emails
CREATE POLICY "Admins can delete admin emails" ON admin_emails
  FOR DELETE USING (
    auth.jwt() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Insert default site configuration values
INSERT INTO site_config (key, value) VALUES
  ('stream_url', ''),
  ('spotify_playlist_id', ''),
  ('youtube_playlist_id', '');

-- Note: You'll need to manually insert the first admin email using the Supabase dashboard
-- or service role key, since RLS policies prevent public insertion:
-- INSERT INTO admin_emails (email) VALUES ('your-admin@email.com');

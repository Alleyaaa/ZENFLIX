-- ============================================================
-- ZENFLIX DATABASE SCHEMA
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS PROFILE (extend auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free', -- free, standard, premium, ultimate
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMPTZ,
  watch_time_seconds BIGINT DEFAULT 0, -- total menit nonton
  films_watched INTEGER DEFAULT 0,
  series_watched INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  locale TEXT DEFAULT 'id', -- id, en
  theme TEXT DEFAULT 'dark', -- dark, light
  notification_enabled BOOLEAN DEFAULT TRUE
);

-- Auto-profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. WATCH PROGRESS (movie/series progress per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watch_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id BIGINT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  current_episode BIGINT DEFAULT 1, -- untuk TV
  current_season BIGINT DEFAULT 1,   -- untuk TV
  progress_seconds BIGINT DEFAULT 0, -- detik sudah ditonton
  duration_seconds BIGINT DEFAULT 0, -- total durasi
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type, current_season, current_episode)
);

CREATE INDEX idx_watch_progress_user ON public.watch_progress(user_id);
CREATE INDEX idx_watch_progress_tmdb ON public.watch_progress(tmdb_id, media_type);

-- ============================================================
-- 3. WATCH HISTORY (riwayat tonton untuk leaderboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id BIGINT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  season_number BIGINT DEFAULT 1,
  episode_number BIGINT DEFAULT 1,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  duration_watched BIGINT DEFAULT 0, -- detik yang ditonton sesi itu
  completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_watch_history_user ON public.watch_history(user_id);
CREATE INDEX idx_watch_history_watched_at ON public.watch_history(watched_at);

-- ============================================================
-- 4. WATCHLIST & FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id BIGINT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT,
  poster_url TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id BIGINT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- ============================================================
-- 5. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'standard', 'premium', 'ultimate')),
  active BOOLEAN DEFAULT FALSE,
  midtrans_order_id TEXT UNIQUE,
  midtrans_transaction_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT, -- credit_card, bank_transfer, gopay, qris, etc
  last_payment_amount BIGINT,
  last_payment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_order ON public.subscriptions(midtrans_order_id);

-- ============================================================
-- 6. ACHIEVEMENTS & MEDALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- 'first_watch', 'marathon_10', 'century_club', etc
  name_id TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_id TEXT,
  description_en TEXT,
  icon TEXT, -- lucide icon name or emoji
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  condition_type TEXT NOT NULL, -- 'films_watched', 'watch_time', 'streak_days', 'genres_explored'
  condition_value BIGINT NOT NULL,
  xp_reward BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress BIGINT DEFAULT 0, -- untuk achievement yang butuh progress
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- ============================================================
-- 6b. TIER/TITLE SYSTEM (berdasarkan watch_time, films_watched)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_titles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title_id TEXT NOT NULL, -- 'newbie', 'casual_viewer', 'cinephile', 'binge_master', 'marathon_master', 'century_club', 'zenflix_legend'
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE, -- hanya 1 active title
  UNIQUE(user_id, title_id)
);

CREATE INDEX idx_user_titles_user ON public.user_titles(user_id);

-- ============================================================
-- 7. LEADERBOARD (cached, di-refresh via cron)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  rank INTEGER NOT NULL,
  score BIGINT NOT NULL, -- watch_time_seconds atau films_watched
  metric TEXT NOT NULL CHECK (metric IN ('watch_time', 'films_watched', 'series_watched')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, metric, period_start, period_end)
);

CREATE INDEX idx_leaderboard_period ON public.leaderboard(period, metric, period_start, period_end);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(period, metric, period_start, period_end, rank);

-- ============================================================
-- 8. ADS CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ads_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot TEXT UNIQUE NOT NULL, -- 'home_hero', 'between_rows', 'player_pre_roll', 'player_mid_roll', 'sidebar', 'genre_page_top'
  enabled BOOLEAN DEFAULT TRUE,
  html_content TEXT, -- HTML/JS ad code
  priority INTEGER DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all', -- 'all', 'free', 'premium'
  max_impressions_per_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad impressions tracking
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads_config(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT, -- hash IP untuk frequency capping
  impression_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_ad_impressions_ad ON public.ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_user ON public.ad_impressions(user_id);
CREATE INDEX idx_ad_impressions_time ON public.ad_impressions(impression_at);

-- ============================================================
-- 8b. ADS CLICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  impression_id UUID REFERENCES public.ad_impressions(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa baca/update milik sendiri, admin bisa semua
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Watch progress: user CRUD milik sendiri
DROP POLICY IF EXISTS "wp_select_own" ON public.watch_progress;
CREATE POLICY "wp_select_own" ON public.watch_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wp_insert_own" ON public.watch_progress;
CREATE POLICY "wp_insert_own" ON public.watch_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wp_update_own" ON public.watch_progress;
CREATE POLICY "wp_update_own" ON public.watch_progress FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wp_delete_own" ON public.watch_progress;
CREATE POLICY "wp_delete_own" ON public.watch_progress FOR DELETE USING (auth.uid() = user_id);

-- Watch history: user CRUD milik sendiri
DROP POLICY IF EXISTS "wh_select_own" ON public.watch_history;
CREATE POLICY "wh_select_own" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wh_insert_own" ON public.watch_history;
CREATE POLICY "wh_insert_own" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watchlist & favorites
DROP POLICY IF EXISTS "wl_select_own" ON public.watchlist;
CREATE POLICY "wl_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wl_insert_own" ON public.watchlist;
CREATE POLICY "wl_insert_own" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wl_delete_own" ON public.watchlist;
CREATE POLICY "wl_delete_own" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "fav_select_own" ON public.favorites;
CREATE POLICY "fav_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "fav_insert_own" ON public.favorites;
CREATE POLICY "fav_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "fav_delete_own" ON public.favorites;
CREATE POLICY "fav_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "sub_select_own" ON public.subscriptions;
CREATE POLICY "sub_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "sub_insert_own" ON public.subscriptions;
CREATE POLICY "sub_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "ua_select_own" ON public.user_achievements;
CREATE POLICY "ua_select_own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Titles
DROP POLICY IF EXISTS "ut_select_own" ON public.user_titles;
CREATE POLICY "ut_select_own" ON public.user_titles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ut_update_own" ON public.user_titles;
CREATE POLICY "ut_update_own" ON public.user_titles FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard: read-only untuk user, admin bisa insert via cron
DROP POLICY IF EXISTS "lb_select_all" ON public.leaderboard;
CREATE POLICY "lb_select_all" ON public.leaderboard FOR SELECT USING (true);

-- Ads: public read, admin manage
DROP POLICY IF EXISTS "ads_read" ON public.ads_config;
CREATE POLICY "ads_read" ON public.ads_config FOR SELECT USING (enabled = true);
DROP POLICY IF EXISTS "ad_imp_insert" ON public.ad_impressions;
CREATE POLICY "ad_imp_insert" ON public.ad_impressions FOR INSERT WITH CHECK (true);

-- Watchlist & favorites public read for owner
DROP POLICY IF EXISTS "fav_select_own" ON public.favorites;
CREATE POLICY "fav_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "fav_insert_own" ON public.favorites;
CREATE POLICY "fav_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "fav_delete_own" ON public.favorites;
CREATE POLICY "fav_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 10. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated ON public.profiles;
CREATE TRIGGER trigger_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER trigger_subscriptions_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ads_updated ON public.ads_config;
CREATE TRIGGER trigger_ads_updated BEFORE UPDATE ON public.ads_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger auto-achievement check on watch_history insert
CREATE OR REPLACE FUNCTION public.check_achievements_on_watch()
RETURNS TRIGGER AS $$
DECLARE
  ach RECORD;
  user_stats RECORD;
BEGIN
  -- Ambil statistik user
  SELECT films_watched, watch_time_seconds, series_watched INTO user_stats
  FROM public.profiles WHERE id = NEW.user_id;

  -- Loop achievement yang condition match
  FOR ach IN SELECT * FROM public.achievements WHERE is_active = true LOOP
    IF ach.condition_type = 'films_watched' AND user_stats.films_watched >= ach.condition_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress)
      VALUES (NEW.user_id, ach.id, user_stats.films_watched)
      ON CONFLICT (user_id, achievement_id) DO UPDATE SET progress = EXCLUDED.progress;
    ELSIF ach.condition_type = 'watch_time' AND user_stats.watch_time_seconds >= ach.condition_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress)
      VALUES (NEW.user_id, ach.id, user_stats.watch_time_seconds)
      ON CONFLICT (user_id, achievement_id) DO UPDATE SET progress = EXCLUDED.progress;
    ELSIF ach.condition_type = 'series_watched' AND user_stats.series_watched >= ach.condition_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress)
      VALUES (NEW.user_id, ach.id, user_stats.series_watched)
      ON CONFLICT (user_id, achievement_id) DO UPDATE SET progress = EXCLUDED.progress;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_achievements ON public.watch_history;
CREATE TRIGGER trigger_check_achievements
  AFTER INSERT ON public.watch_history
  FOR EACH ROW EXECUTE FUNCTION public.check_achievements_on_watch();

-- Trigger update profile stats on watch_progress update
CREATE OR REPLACE FUNCTION public.update_profile_on_watch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed AND NOT OLD.completed THEN
    UPDATE public.profiles SET
      films_watched = films_watched + CASE WHEN NEW.media_type = 'movie' THEN 1 ELSE 0 END,
      series_watched = series_watched + CASE WHEN NEW.media_type = 'tv' THEN 1 ELSE 0 END,
      watch_time_seconds = watch_time_seconds + NEW.progress_seconds
    WHERE id = NEW.user_id;
  ELSIF NEW.progress_seconds > OLD.progress_seconds THEN
    UPDATE public.profiles SET
      watch_time_seconds = watch_time_seconds + (NEW.progress_seconds - OLD.progress_seconds)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profile_watch ON public.watch_progress;
CREATE TRIGGER trigger_profile_watch
  AFTER UPDATE ON public.watch_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_on_watch();

-- Trigger update watch_history on watch_progress complete
CREATE OR REPLACE FUNCTION public.create_history_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed AND NOT OLD.completed THEN
    INSERT INTO public.watch_history (user_id, tmdb_id, media_type, season_number, episode_number, duration_watched, completed)
    VALUES (NEW.user_id, NEW.tmdb_id, NEW.media_type, NEW.current_season, NEW.current_episode, NEW.duration_seconds, true)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_history_complete ON public.watch_progress;
CREATE TRIGGER trigger_history_complete
  AFTER UPDATE ON public.watch_progress
  FOR EACH ROW EXECUTE FUNCTION public.create_history_on_complete();

-- ============================================================
-- 11. SEED ACHIEVEMENTS
-- ============================================================

INSERT INTO public.achievements (code, name_id, name_en, description_id, description_en, icon, tier, condition_type, condition_value, xp_reward) VALUES
-- Films watched
('first_watch', 'Pertama Kali', 'First Watch', 'Tonton film pertamamu', 'Watch your first movie', '🎬', 'bronze', 'films_watched', 1, 10),
('cinephile_10', 'Cinephile Pemula', 'Junior Cinephile', 'Tonton 10 film', 'Watch 10 movies', '🎞️', 'bronze', 'films_watched', 10, 50),
('cinephile_50', 'Cinephile', 'Cinephile', 'Tonton 50 film', 'Watch 50 movies', '🎥', 'silver', 'films_watched', 50, 200),
('century_club', 'Klub Abad', 'Century Club', 'Tonton 100 film', 'Watch 100 movies', '💯', 'gold', 'films_watched', 100, 500),
('marathon_master', 'Master Marathon', 'Marathon Master', 'Tonton 500 film', 'Watch 500 movies', '🏃', 'platinum', 'films_watched', 500, 1000),
('legend', 'Legenda Zenflix', 'Zenflix Legend', 'Tonton 1000 film', 'Watch 1000 movies', '👑', 'diamond', 'films_watched', 1000, 5000),

-- Watch time
('hour_1', '1 Jam', '1 Hour', 'Tonton 1 jam', 'Watch 1 hour', '⏱️', 'bronze', 'watch_time', 3600, 10),
('hour_10', '10 Jam', '10 Hours', 'Tonton 10 jam', 'Watch 10 hours', '⏰', 'silver', 'watch_time', 36000, 100),
('hour_100', '100 Jam', '100 Hours', 'Tonton 100 jam', 'Watch 100 hours', '🕰️', 'gold', 'watch_time', 360000, 500),
('hour_1000', '1000 Jam', '1000 Hours', 'Tonton 1000 jam', 'Watch 1000 hours', '♾️', 'diamond', 'watch_time', 3600000, 2000),

-- Series
('series_1', 'Pertama Series', 'First Series', 'Tonton series pertamamu', 'Watch your first series', '📺', 'bronze', 'series_watched', 1, 10),
('series_10', 'Series Addict', 'Series Addict', 'Tonton 10 series', 'Watch 10 series', '📺', 'silver', 'series_watched', 10, 100),
('series_50', 'Series Master', 'Series Master', 'Tonton 50 series', 'Watch 50 series', '🎬', 'gold', 'series_watched', 50, 500),

-- Genre explorer
('genre_explorer_5', 'Penjelajah Genre', 'Genre Explorer', 'Tonton film dari 5 genre berbeda', 'Watch movies from 5 different genres', '🧭', 'bronze', 'genres_explored', 5, 50),
('genre_explorer_10', 'Jurus Genre', 'Genre Master', 'Tonton film dari 10 genre berbeda', 'Watch movies from 10 different genres', '🗺️', 'silver', 'genres_explored', 10, 200),

-- Streak & special
('night_owl', 'Burung Hantu', 'Night Owl', 'Tonton film jam 00:00-05:00', 'Watch movie at midnight', '🦉', 'silver', 'night_watch', 1, 100),
('early_bird', 'Biru Mudah', 'Early Bird', 'Tonton film jam 05:00-08:00', 'Watch movie early morning', '🐦', 'silver', 'morning_watch', 1, 100),
('weekend_warrior', 'Weekend Warrior', 'Weekend Warrior', 'Tonton 3+ film di weekend', 'Watch 3+ movies in a weekend', '⚔️', 'gold', 'weekend_binge', 3, 300);

-- ============================================================
-- 10b. SEED TITLES
-- ============================================================
-- Titles di-handle via trigger/update profile, tapi definisikan di sini untuk referensi:
-- 'newbie' (default), 'casual_viewer' (5 film), 'cinephile' (20 film), 'binge_master' (50 film), 'marathon_master' (100 film), 'century_club' (200 film), 'zenflix_legend' (500 film)
-- Title otomatis di-assign via trigger profile update

-- ============================================================
-- 11. SEED ADS SLOTS (contoh)
-- ============================================================

INSERT INTO public.ads_config (slot, enabled, html_content, priority, target_audience, max_impressions_per_day) VALUES
('home_hero', true, '<div class="ad-slot home-hero">[AdSense/Adsterra Code Here]</div>', 10, 'free', 100),
('between_rows', true, '<div class="ad-slot between-rows">[AdSense/Adsterra Code Here]</div>', 5, 'free', 200),
('player_pre_roll', true, '<div class="ad-slot pre-roll">[VAST/Video Ad Code Here]</div>', 20, 'free', 50),
('sidebar', false, '<div class="ad-slot sidebar">[AdSense Code Here]</div>', 1, 'free', 500)
ON CONFLICT (slot) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================

-- Setelah run script ini:
-- 1. Jalankan di Supabase Dashboard → SQL Editor
-- 2. Set Storage Bucket untuk avatar upload (bucket: avatars, public)
-- 3. Setup cron job untuk refresh leaderboard (via Supabase Cron / pg_cron)
-- 4. Setup Midtrans webhook di Vercel: https://domain/api/payment
-- 5. Test auth, player, progress, achievements
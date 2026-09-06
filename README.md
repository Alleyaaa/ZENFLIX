# 🎬 Zenflix — Streaming Film Gratis Premium

> Streaming film & series terbaik dalam HD, tanpa buffering. Dibangun dengan Next.js, TypeScript, Tailwind, Supabase, dan TMDB.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Fitur

### 🎥 Streaming
- **4 Channel player** (Source 1-4) dari mirror VidSrc — otomatis fallback
- **Resume dari posisi terakhir** (progress tersimpan per user)
- **Skip intro** untuk film/series
- **Trailer YouTube resmi** sebagai fallback terakhir
- Subtitle default Bahasa Indonesia (`ds_lang=id`)
- Auto-next episode untuk TV series

### 🗂️ Browse
- **19+ genre** lengkap dengan pagination (24/36/48/60 per halaman)
- Filter **Tahun** (2017-2026), **Negara** (12 negara), **Jaringan/Source** (Netflix, HBO, dll)
- **Koleksi** film (Marvel, DC, Star Wars, Harry Potter, dll)
- Pencarian instan dengan debounce + autocomplete

### 👤 Akun & Progress
- Register/Login via Supabase Auth
- **Watchlist & Favorit** tersimpan per user
- **Riwayat nonton** + **Lanjutkan menonton** (progress bar)
- Profile lengkap: stats, achievement, subscription, leaderboard

### 🏆 Gamification
- **Achievement & Medal** (25+ jenis, 5 tier: Bronze→Diamond)
- **Reward points** yang bisa dikumpulkan
- **User Tier** (Newbie → Watcher → Cinephile → Film Buff → Binge Master → Marathon Master → Zenflix Legend)
- **Leaderboard** (Harian/Mingguan/Bulanan/Semua Waktu)
- **Notifikasi badge** di pojok kanan bawah saat achievement terbuka

### 💳 Subscription
- 4 paket: **Free, Standard, Premium, Ultimate**
- Payment via **Midtrans** (credit card, bank transfer, QRIS, e-wallet)
- Webhook verifikasi signature + auto-update subscription

### 📢 Monetisasi
- Slot **iklan** (AdSlot component): home, genre, player, sidebar
- User premium = **bebas iklan**
- CTA **"Nonton Tanpa Iklan"** untuk upgrade

### 🔍 SEO
- Meta dinamis per halaman
- `sitemap.xml` + `robots.txt`
- JSON-LD Movie schema
- PWA `manifest.webmanifest`
- Open Graph + Twitter Card

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yourusername/ZENFLIX.git
cd ZENFLIX

# 2. Setup environment
cp .env.example .env
# Isi TMDB_API_KEY, Supabase keys, Midtrans keys

# 3. Setup database (Supabase → SQL Editor → jalankan supabase_schema.sql)

# 4. Install & run
npm install
npm run dev
# Buka http://localhost:3000

# Atau pakai Docker
docker build -t zenflix-app .
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
```

## 🐳 Docker

```bash
docker build -t zenflix-app .
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
# Buka http://localhost:3005
```

## 🌍 Deploy ke Vercel

```bash
npx vercel login
npx vercel --prod
```

Set environment variables di Vercel Dashboard:
```
TMDB_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
NEXT_PUBLIC_SITE_URL
```

## 🔑 Environment Variables

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `TMDB_API_KEY` | ✅ | API key dari themoviedb.org |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key Supabase (public) |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key (server-only) |
| `MIDTRANS_SERVER_KEY` | ✅ | Server key Midtrans |
| `MIDTRANS_CLIENT_KEY` | ✅ | Client key Midtrans |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | ✅ | Client key Midtrans (public) |
| `NEXT_PUBLIC_SITE_URL` | ❌ | URL situs (default: vercel.app) |

## 🗄️ Database

Jalankan `supabase_schema.sql` di Supabase SQL Editor. Isi tabel:
`profiles`, `watch_progress`, `watch_history`, `watchlist`, `favorites`, `subscriptions`, `achievements`, `user_achievements`, `user_titles`, `leaderboard`, `ads_config`, `ad_impressions`

## 🛠️ Tech Stack

- **Next.js 16** (App Router, Turbopack, Server Components)
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL)
- **TMDB API** (data film/series)
- **VidSrc** (player streaming multi-mirror)
- **Midtrans** (payment gateway ID)
- **Vercel** (deploy)

## 📄 License

MIT © Zenflix — bebas pakai, fork, & modifikasi.
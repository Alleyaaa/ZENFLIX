# 🎬 ZENFLIX

> Stream the best movies & series in stunning HD, zero buffering.

Zenflix adalah platform streaming film gratis berbasis **Next.js 16** dengan integrasi **TMDB API**, **Supabase Auth**, dan containerized via **Docker**. iOS-style glassmorphism UI, live search, TV series support, dan player multi-source (VidSrc + 2Embed).

---

## ✨ Fitur

| Fitur | Status |
|-------|--------|
| 🎥 Trending, Now Playing, Popular, Top Rated | ✅ |
| 🔍 Live Search Dropdown | ✅ |
| 📺 TV Series + Season/Episode Picker | ✅ |
| ▶️ Dual Player (VidSrc + 2Embed fallback) | ✅ |
| 🔐 Supabase Auth (Email/Password) | ✅ |
| 🎨 Glassmorphism iOS-style UI | ✅ |
| 🐳 Docker Container | ✅ |
| 🔄 Genres & Category Pages | ✅ |

---

## 🖼️ Screenshots

*(coming soon)*

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop (Windows) / Docker Engine (Linux)
- TMDB API Key ([dapatkan di sini](https://www.themoviedb.org/settings/api))

### 1. Clone & Install

```bash
git clone https://github.com/Alleyaaa/ZENFLIX.git
cd ZENFLIX
npm install
```

### 2. Environment Variables

Buat file `.env` di root project:

```env
TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_URL=your_supabase_url
```

### 3. Jalankan (Docker)

```bash
docker build -t zenflix-app .
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
```

Buka **http://localhost:3005** 🎉

### 4. Atau Tanpa Docker (Development)

```bash
npm run dev
```

Buka **http://localhost:3000** 🎉

---

## 🏗️ Arsitektur

```
src/
├── app/
│   ├── api/                      # API Routes
│   │   ├── genres/route.ts       # Genre list
│   │   ├── search/route.ts       # Search endpoint
│   │   ├── seed/route.ts         # Database seeder
│   │   └── trending/route.ts     # Trending endpoint
│   ├── movie/[id]/page.tsx       # Movie detail + player
│   ├── tv/[id]/page.tsx          # TV series detail + player
│   ├── category/[slug]/page.tsx  # Category listing
│   ├── genre/[id]/page.tsx       # Genre listing
│   ├── auth/page.tsx             # Login / Register
│   ├── search/page.tsx           # Search results
│   ├── subscribe/page.tsx        # Premium subscribe
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   ├── Header.tsx                # Navigation + Search
│   ├── MovieCard.tsx             # Movie poster card
│   ├── MovieRow.tsx              # Horizontal scroll row
│   ├── TrendingRow.tsx           # Featured trending
│   ├── Player.tsx                # Movie player (VidSrc)
│   ├── PlayerTV.tsx              # TV player with episodes
│   ├── PlayerSection.tsx         # Auth-gated player
│   ├── HeroButtons.tsx           # Hero CTA buttons
│   ├── SearchDropdown.tsx        # Live search dropdown
│   ├── AuthForm.tsx              # Auth form
│   ├── AuthModal.tsx             # Auth modal
│   └── AuthProvider.tsx          # Session context
├── lib/
│   ├── tmdb.ts                   # TMDB API client
│   └── supabase.ts               # Supabase client
└── globals.css                   # Global styles + glassmorphism
```

---

## 🐳 Docker Notes

**Masalah DNS di Windows** kadang bikin container gagal resolve `image.tmdb.org`. Solusi:

```bash
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
```

Atau setting manual di `C:\ProgramData\Docker\config\daemon.json`:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (Turbopack)
- **UI:** [Tailwind CSS 4](https://tailwindcss.com/) + Custom Glassmorphism
- **Auth:** [Supabase](https://supabase.com/)
- **Data:** [TMDB API](https://developers.themoviedb.org/3)
- **Player:** VidSrc Embed + 2Embed fallback
- **Runtime:** Node.js 20 (Docker Alpine)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Checkpoint `v0.1.0`

**Status:** ✅ Production-ready

**Fitur berfungsi penuh:**
- [x] Homepage trending, now playing, popular, top rated
- [x] Live search dropdown dengan debounce
- [x] Detail film dengan sinopsis penuh, cast, similar
- [x] TV series dengan season/episode selection
- [x] Dual player (VidSrc primary, 2Embed fallback)
- [x] Supabase auth (register, login, session)
- [x] Genre & category pages
- [x] Responsive iOS-style glassmorphism UI
- [x] Docker multi-stage build (production)

**Diketahui:**
- Poster image membutuhkan `--dns 8.8.8.8` di Docker Windows
- VidSrc watermark tidak bisa dihilangkan (by design)

---

## 🤝 Kontribusi

Pull requests welcome! Untuk perubahan besar, buka issue dulu ya.

---

## 📄 Lisensi

MIT © [Alleyaaa](https://github.com/Alleyaaa)

---

> Dibangun dengan ❤️ oleh Millen & Hermes Agent

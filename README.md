<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-%5E5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Docker-Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Supabase-FF4438?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TMDB_API-01D277?style=for-the-badge&logo=themoviedatabase&logoColor=white" alt="TMDB" />
</div>

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Inter&weight=900&size=48&duration=3000&pause=500&color=60A5FA&center=true&vCenter=true&width=600&height=80&lines=ZENFLIX;NONTON+FILM+GRATIS;STREAMING+HD;ZERO+BUFFERING" />
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=900&size=48&duration=3000&pause=500&color=1E40AF&center=true&vCenter=true&width=600&height=80&lines=ZENFLIX;NONTON+FILM+GRATIS;STREAMING+HD;ZERO+BUFFERING" />
  </picture>
</p>

<p align="center">
  <b>Stream the best movies & series in stunning HD, zero buffering.</b><br />
  Platform streaming film gratis dengan iOS-style glassmorphism UI,<br />
  live search, TV series support, dan dual-player (VidSrc + 2Embed).
</p>

<p align="center">
  <a href="#-fitur">✨ Fitur</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-arsitektur">🏗️ Arsitektur</a> •
  <a href="#-variabel-lingkungan">🔐 .env</a> •
  <a href="#-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-checkpoint-v010">📦 Checkpoint</a>
</p>

---

## ✨ Fitur

<table>
  <tr>
    <td align="center">🎥</td>
    <td><b>Trending, Now Playing, Popular, Top Rated</b><br/>4 kategori film real-time dari TMDB</td>
  </tr>
  <tr>
    <td align="center">🔍</td>
    <td><b>Live Search Dropdown</b><br/>Cari film instan dengan debounce + autocomplete</td>
  </tr>
  <tr>
    <td align="center">📺</td>
    <td><b>TV Series + Season/Episode Picker</b><br/>Episode selector & player khusus series</td>
  </tr>
  <tr>
    <td align="center">▶️</td>
    <td><b>Dual Player (VidSrc + 2Embed)</b><br/>Primary player + fallback untuk resolusi</td>
  </tr>
  <tr>
    <td align="center">🔐</td>
    <td><b>Supabase Auth</b><br/>Register & login dengan session persistence</td>
  </tr>
  <tr>
    <td align="center">🎨</td>
    <td><b>Glassmorphism iOS-style UI</b><br/>Dark theme dengan efek kaca, gradient text</td>
  </tr>
  <tr>
    <td align="center">🐳</td>
    <td><b>Docker Multi-Stage</b><br/>Production build siap deploy (154MB final image)</td>
  </tr>
  <tr>
    <td align="center">🔄</td>
    <td><b>Genres & Category Pages</b><br/>Browse film berdasarkan genre & kategori</td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ _(atau Docker Desktop untuk container)_
- **TMDB API Key** — [daftar gratis di sini](https://www.themoviedb.org/settings/api)
- **Supabase Project** — [buat proyek gratis](https://supabase.com)

### 1. Clone

```bash
git clone https://github.com/Alleyaaa/ZENFLIX.git
cd ZENFLIX
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

> `.env.example` sudah tersedia — tinggal rename dan isi.

### 3. Jalankan dengan Docker 🐳

```bash
docker build -t zenflix-app .
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
```

Buka **http://localhost:3005** 🎉

### 4. Atau tanpa Docker (Development)

```bash
npm install
npm run dev
```

Buka **http://localhost:3000** 🎉

---

## 🏗️ Arsitektur

```
zenflix/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes (server-side)
│   │   │   ├── genres/route.ts     #  GET /api/genres
│   │   │   ├── search/route.ts     #  GET /api/search?q=
│   │   │   ├── seed/route.ts       #  POST /api/seed
│   │   │   └── trending/route.ts   #  GET /api/trending
│   │   ├── movie/[id]/page.tsx     #  Detail + player film
│   │   ├── tv/[id]/page.tsx        #  Detail + player series
│   │   ├── category/[slug]/page.tsx#  Category listing
│   │   ├── genre/[id]/page.tsx     #  Genre listing
│   │   ├── auth/page.tsx           #  Login / Register
│   │   ├── search/page.tsx         #  Search results
│   │   ├── subscribe/page.tsx      #  Premium subscribe
│   │   ├── layout.tsx              #  Root layout
│   │   └── page.tsx                #  Homepage (server-rendered)
│   ├── components/
│   │   ├── Header.tsx              #  Navbar + search
│   │   ├── MovieCard.tsx           #  Poster card
│   │   ├── MovieRow.tsx            #  Horizontal scroll row
│   │   ├── TrendingRow.tsx         #  Featured trending
│   │   ├── Player.tsx              #  Movie player (VidSrc)
│   │   ├── PlayerTV.tsx            #  Series player + episodes
│   │   ├── PlayerSection.tsx       #  Auth-gated player
│   │   ├── HeroButtons.tsx         #  Hero CTA buttons
│   │   ├── SearchDropdown.tsx      #  Live search dropdown
│   │   ├── AuthForm.tsx            #  Auth form
│   │   ├── AuthModal.tsx           #  Auth modal
│   │   └── AuthProvider.tsx        #  Session context
│   ├── lib/
│   │   ├── tmdb.ts                 #  TMDB API client
│   │   └── supabase.ts             #  Supabase client
│   └── globals.css                 #  Global styles + glassmorphism
├── Dockerfile                      #  Multi-stage build
├── next.config.mjs                 #  Next.js config
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Variabel Lingkungan

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `TMDB_API_KEY` | ✅ | API key dari themoviedb.org |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL Project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key dari Supabase |
| `SUPABASE_KEY` | ✅ | Service role key (admin) |
| `SUPABASE_URL` | ✅ | Sama dengan public URL |

---

## 🐳 Docker Notes

Container sudah dioptimalkan dengan **multi-stage build**:
- **Base stage:** Install dependencies + build Next.js
- **Runner stage:** Hanya copy `.next`, `node_modules`, `public` — image size **~154MB**

**DNS di Windows:** Karena Docker Desktop di Windows terkadang gagal resolve `image.tmdb.org`, gunakan flag `--dns`:

```bash
docker run -d --name zenflix-app --rm -p 3005:3000 --dns 8.8.8.8 --env-file .env zenflix-app
```

Atau set permanent di `C:\ProgramData\Docker\config\daemon.json`:
```json
{ "dns": ["8.8.8.8", "8.8.4.4"] }
```

---

## 🛠️ Tech Stack

<div align="center">

| Teknologi | Fungsi |
|-----------|--------|
| [![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=next.js)](https://nextjs.org/) | Framework React (Turbopack) |
| [![TypeScript](https://img.shields.io/badge/TypeScript-%5E5-3178C6?logo=typescript)](https://www.typescriptlang.org/) | Type safety |
| [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/) | Utility-first CSS |
| [![Supabase](https://img.shields.io/badge/Supabase-FF4438?logo=supabase)](https://supabase.com/) | Auth + Database |
| [![TMDB](https://img.shields.io/badge/TMDB_API-01D277?logo=themoviedatabase)](https://developers.themoviedb.org/3) | Movie/TV data |
| [![Docker](https://img.shields.io/badge/Docker-Alpine-2496ED?logo=docker)](https://docker.com/) | Containerization |
| [![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?logo=lucide)](https://lucide.dev/) | Icons |

</div>

---

## 📦 Checkpoint `v0.1.0`

**Status:** ✅ **Production-ready** — berfungsi penuh di lokal & Docker.

### ✅ Berfungsi Penuh
- [x] Homepage dengan Trending, Now Playing, Popular, Top Rated
- [x] Live search dropdown dengan debounce dari TMDB
- [x] Detail film: sinopsis, cast, rating, similar movies
- [x] TV Series: season/episode picker + player khusus
- [x] Dual player: VidSrc (primary) + 2Embed (fallback)
- [x] Supabase auth: register, login, session persistence
- [x] Genre & category browsing
- [x] iOS-style glassmorphism UI (merata di seluruh halaman)
- [x] Docker multi-stage build siap produksi
- [x] Lazy loading poster & smooth scroll hero buttons

### ⚠️ Diketahui
- **Poster TMDB di Docker Windows** membutuhkan `--dns 8.8.8.8` (bukan bug kode — issue WSL2/Docker Desktop)
- **VidSrc watermark** tidak bisa dihapus (by design dari embed provider)
- Belum ada **PWA / mobile install prompt**

---

## 🤝 Kontribusi

Pull requests & issue sangat diterima! Untuk perubahan besar, buka issue dulu ya.

1. Fork repo
2. Buat branch fitur: `git checkout -b feat/keren-banget`
3. Commit: `git commit -m 'feat: nambah fitur keren'`
4. Push: `git push origin feat/keren-banget`
5. Buka Pull Request

---

## 📄 Lisensi

MIT © [Alleyaaa](https://github.com/Alleyaaa) — bebas pakai, fork, & modifikasi.

---

<p align="center">
  <sub>Dibangun dengan 🧊 oleh <b>Millen</b> & <a href="https://github.com/NousResearch/hermes-agent">Hermes Agent</a></sub>
  <br />
  <sub>⭐ Star repo ini kalau suka! ⭐</sub>
</p>

<p align="center">
  <a href="https://github.com/Alleyaaa/ZENFLIX/stargazers">
    <img src="https://img.shields.io/github/stars/Alleyaaa/ZENFLIX?style=for-the-badge&color=60A5FA" alt="Stars" />
  </a>
  <a href="https://github.com/Alleyaaa/ZENFLIX/issues">
    <img src="https://img.shields.io/github/issues/Alleyaaa/ZENFLIX?style=for-the-badge&color=F87171" alt="Issues" />
  </a>
  <a href="https://github.com/Alleyaaa/ZENFLIX/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge" alt="License" />
  </a>
</p>

# Zenflix Tech Stack

| Layer | Tech | Versi |
|-------|------|-------|
| Framework | Next.js | 16.2.9 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | hosted |
| Auth | Supabase Auth + Google OAuth | hosted |
| Media API | TMDB | v3 |
| Video Embed | VidSrc | iframe |
| Payment | Midtrans | sandbox |
| Deploy | Vercel | edge/serverless |
| Icons | lucide-react | 1.x |

## Keputusan Teknis (Decision Log)
1. Pakai Next.js App Router (bukan Pages Router) - modern, streaming SSR
2. Supabase bukan custom backend - cepat, auth+DB gratis
3. TMDB untuk metadata - API lengkap, gratis
4. VidSrc embed (bukan encoding sendiri) - MVP cepat
5. Vercel (bukan Docker) - zero-ops, serverless
6. Midtrans untuk payment lokal - support Indonesia

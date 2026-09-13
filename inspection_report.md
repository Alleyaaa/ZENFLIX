# Zenflix Codebase Inspection Report

## Overview
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript/TypeScriptX (45 TSX, 25 TS files)
- **Total LOC**: 6,690 lines
- **Components**: 21 React components
- **API Routes**: 14 endpoints
- **Pages**: 23 pages

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **Payments**: Midtrans
- **External API**: TMDB (The Movie Database)
- **Video Source**: VidSrc (iframe embed)
- **Deployment**: Vercel

## Architecture Summary
- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **Database**: Supabase (PostgreSQL) + localStorage fallback
- **External APIs**: TMDB (metadata), VidSrc (video embed), Midtrans (payments)
- **Deployment**: Vercel (Edge + Serverless)

## Component Inventory
| Component | Type | Purpose |
|-----------|------|---------|
| HeroSlider | Client | Hero carousel with video autoplay |
| MovieCard | Client | Movie thumbnail card (Netflix-style) |
| DbMovieRow | Client | Horizontal scroll row |
| TVEpisodePicker | Client | TV series episode selector |
| PlayerTV / Player | Client | Video player (iframe embed) |
| PlayerModal | Client | Modal video player |
| DbMovieRow | Server/Client | Server-rendered movie row |
| Header | Client | Navigation + auth |
| AuthForm | Client | Login/Register form |
| AuthProvider | Context | Auth state management |
| SearchDropdown | Client | Live search dropdown |
| AdSlot | Client | Ad placement |
| MovieGrid / MovieRow | Client | Grid/row layouts |
| WatchlistButton | Client | Watchlist toggle |
| AuthForm / AuthProvider | Client/Context | Auth flow |

## API Routes (14 endpoints)
| Route | Purpose |
|-------|---------|
| /api/trending | Trending movies |
| /api/movies | Movie listing with filters |
| /api/search | Search autocomplete |
| /api/genres | Genre list |
| /api/seed | Seed database |
| /api/trailer | YouTube trailer key |
| /api/stream | Video stream proxy |
| /api/watchlist | Watchlist CRUD |
| /api/subscription | Midtrans subscription |
| /api/payment | Midtrans webhook |
| /api/trailer | YouTube trailer key |
| /api/episode-info | TV episode details |
| /api/stream | Video stream proxy |
| /api/sql | SQL executor (admin) |

## Code Quality Metrics
- **Total LOC**: 6,690 lines
- **TypeScript files**: 70 (45 TSX + 25 TS)
- **Components**: 21 React components
- **API Routes**: 14 endpoints
- **Pages**: 23 pages
- **Lint**: 0 errors, 39 warnings (mostly unused imports)
- **Build**: Passing (49 routes)

## Technical Debt Identified
1. **Unused imports**: 35+ warnings (unused vars, imports)
2. **Missing tests**: No test files found
3. **Inline styles**: Some inline styles instead of CSS variables
4. **Hardcoded values**: Some hardcoded colors/strings
5. **Missing tests**: No unit/integration/e2e tests
5. No error boundaries
6. No loading boundaries (Suspense)

## Recommendations
1. Run `npm run lint --fix` for quick wins
2. Add test infrastructure (Jest + React Testing Library + Playwright)
3. Extract design tokens to DESIGN.md
6. Add error boundaries & error boundaries
7. Add loading skeletons for all data fetching
8. Implement error boundaries per route

EOF
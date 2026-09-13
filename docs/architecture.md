# Zenflix Architecture

## Overview
Zenflix adalah platform streaming film modern (Next.js 16 + Supabase + TMDB + Vercel).

## Client Layer
- Web app (Next.js 16, React 19, TypeScript, Tailwind)
- Server-side rendering untuk katalog
- Client-side rendering untuk player & auth

## Server Layer (Vercel Serverless + Edge)
- API Routes: 14 endpoints (trending, movies, search, genres, etc.)
- Proxy/Middleware: security headers, rate limiting
- Edge Functions: next-gen edge

## Data Layer
- Supabase PostgreSQL: auth (users), watchlist, subscriptions, watch_history
- TMDB API: metadata film (poster, cast, rating)
- VidSrc: embed video player
- Midtrans: payment gateway

## Media Pipeline
- TMDB -> metadata -> Zenflix UI
- VidSrc iframe -> player (autoplay, channel switching)
- YouTube -> trailer fallback

## Deployment
- Vercel Production: https://zenflix-ten.vercel.app
- Vercel: serverless functions per API route
- DNS via Vercel

# Zenflix FAQ Teknis

## Kenapa pake Next.js 16?
App Router + Turbopack, full-stack React, SSR/ISR built-in.

## Kenapa Supabase?
Auth + PostgreSQL gratis, realtime, supaya fokus ke fitur bukan infra.

## Gimana video di-stream?
Via iframe embed VidSrc dengan fallback channel (4 channel), autoplay + dslang id.

## Gimana auth?
Supabase Auth: email/password + Google OAuth. Session JWT via cookies.

## Gimana payment?
Midtrans Snap: create transaction token di server (/api/subscription), client buka Snap popup. Webhook /api/payment update DB subscription.

---
name: zenflix-cdn-invalidator
description: "CDN cache invalidation for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [cdn, cache, invalidation, zenflix]
---

# zenflix-cdn-invalidator

## Overview
Invalidasi cache CDN otomatis saat konten diupdate/dihapus.

## Trigger
- Konten baru ditambahkan
- Metadata update (poster, sinopsis)
- Episode baru
- Konten dihapus

## API
- `POST /api/cdn/invalidate` { paths: string[] }
- `GET /api/cdn/status?path=...`

## Integrasi
- Cloudflare API / Cloudflare Workers
- Vercel Edge Config
- Supabase Realtime subscription
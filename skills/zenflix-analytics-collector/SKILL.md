---
name: zenflix-analytics-collector
description: "Analytics collector for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [analytics, events, zenflix]
---

# zenflix-analytics-collector

## Overview
Event collector untuk analytics real-time.

## Events
- Page view
- Play / Pause / Seek / Complete
- Search query
- Subscription event
- Error / Buffer

## Pipeline
1. Client -> Edge Function (Vercel Edge)
2. Batch -> Redis Stream
3. Worker -> ClickHouse / PostgreSQL
4. Dashboard: Grafana / Metabase

## Privacy
- Anonimize IP (hash)
- No PII in events
- GDPR / PDPA compliant
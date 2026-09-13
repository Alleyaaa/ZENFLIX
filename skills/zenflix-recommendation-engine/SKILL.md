---
name: zenflix-recommendation-engine
description: "Recommendation engine for Zenflix: content-based + collaborative filtering hybrid"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [recommendation, ml, zenflix]
    homepage: https://github.com/zenflix/recommendation-engine
---

# zenflix-recommendation-engine

## Overview
Hybrid recommendation engine untuk Zenflix: content-based + collaborative filtering.

## Algoritma
1. **Content-based**: TF-IDF pada genre + overview + cast + keywords
2. **Collaborative**: User-item matrix (watch history + rating)
3. **Hybrid**: weighted combine (0.6 content + 0.4 collab)

## API
- `GET /api/recommendations?user_id={id}&limit=20`
- `POST /api/recommendations/train` (cron job harian)

## Tech Stack
- Python (scikit-learn, implicit, pandas)
- Redis cache
- Cron job harian 03:00 WIB
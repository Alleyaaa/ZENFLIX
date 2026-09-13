---
name: zenflix-ab-testing
description: "A/B testing framework for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [ab-testing, experimentation, zenflix]
---

# zenflix-ab-testing

## Overview
Framework A/B testing untuk UI/UX, pricing, recommendation algorithms.

## Fitur
- Feature flags (LaunchDarkly-style)
- User segmentation (cohort, random, rule-based)
- Metric tracking (conversion, retention, engagement)
- Statistical significance (p-value, confidence interval)
- Auto-stop (early stopping)

## API
- `GET /api/ab/variant?experiment=hero_layout&user_id=...`
- `POST /api/ab/event` (track conversion)
- `GET /api/ab/results?experiment=...`

## Stack
- Redis (assignment cache)
- PostgreSQL (results)
- Stats: scipy.stats, statsmodels
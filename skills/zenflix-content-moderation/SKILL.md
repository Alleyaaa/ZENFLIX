---
name: zenflix-content-moderation
description: "Content moderation for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [moderation, safety, zenflix]
---

# zenflix-content-moderation

## Overview
Moderasi konten otomatis + human review.

## Fitur
- Text moderation (toxic, spam, PII)
- Image moderation (NSFW, violence, copyright)
- Video moderation (scene detection)
- User-generated content review queue
- Auto-flag + human review queue

## API
- `POST /api/moderate/text` { text, context }
- `POST /api/moderate/image` { url }
- `POST /api/moderate/video` { url }
- `GET /api/moderate/queue?status=pending`

## Stack
- Google Cloud Vision / AWS Rekognition
- OpenAI Moderation API
- Custom ML models (optional)
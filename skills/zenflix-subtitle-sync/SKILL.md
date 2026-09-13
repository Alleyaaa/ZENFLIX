---
name: zenflix-subtitle-sync
description: "Subtitle synchronization tool for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [subtitle, sync, zenflix]
---

# zenflix-subtitle-sync

## Overview
Sinkronisasi subtitle otomatis dengan audio fingerprinting + forced alignment.

## Fitur
- Auto-sync via acoustic fingerprint (chromaprint)
- Forced alignment (gentle + forced align)
- Offset detection + correction
- Batch processing

## Tech Stack
- Python: librosa, chardet, pysubs2
- ffmpeg (audio extract)
- chromaprint (acoustid)
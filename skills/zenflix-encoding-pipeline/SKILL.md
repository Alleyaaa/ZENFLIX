---
name: zenflix-encoding-pipeline
description: "Video encoding pipeline for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [encoding, video, pipeline, zenflix]
---

# zenflix-encoding-pipeline

## Overview
Pipeline encoding otomatis: upload -> transcode -> package -> CDN.

## Pipeline Stages
1. **Upload** -> S3/R2 bucket (raw)
2. **Probe** -> ffprobe (resolution, bitrate, codec)
3. **Transcode** -> FFmpeg (HLS + DASH)
   - 1080p, 720p, 480p, 360p
   - H.264 + H.265 (HEVC)
   - Audio: AAC 128kbps + 5.1 surround
4. **Package** -> HLS (.m3u8) + DASH (.mpd)
5. **Upload CDN** -> R2 / Cloudflare R2
6. **Notify** -> Supabase Realtime + CDN purge

## Tech Stack
- FFmpeg (GPU: nvidia h264_nvenc / hevc_nvenc)
- AWS MediaConvert / custom FFmpeg
- Cloudflare R2 / AWS S3
- Supabase Realtime notifications
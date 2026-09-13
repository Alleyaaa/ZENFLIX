---
name: zenflix-drm-manager
description: "DRM manager for Zenflix"
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [drm, encryption, zenflix]
---

# zenflix-drm-manager

## Overview
Manajemen DRM (Widevine, PlayReady, FairPlay) untuk konten premium.

## Fitur
- Key management (key rotation, key server)
- License acquisition proxy
- Offline playback support
- Key rotation schedule
- Device binding / offline license

## Stack
- Shaka Packager / Bento4
- Widevine Cloud License Server
- Axinom / PallyCon / custom key server
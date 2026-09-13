'use client'
import { useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Adsterra ads — ALL FORMATS (dari dashboard zenflix-ten.vercel.app)
//
// STRATEGI ANTI-COLLISION:
// Setiap banner di-render sebagai IFRAME ke /ads/<format> (route server).
// Di dalam iframe, atOptions & invoke.js jalan ISOLATED (window sendiri).
// → Tidak ada collision window.atOptions antar banner, ga kena CSP ketat,
//   dan user bisa lihat iklan (frame-src di CSP sudah allow).
//
// Global ads (popunder + socialbar) tetap via script inject.
// ═══════════════════════════════════════════════════════════════════

const GLOBAL_ADS = [
  { id: 'popunder', script: 'https://screwbedriddenheadline.com/49/79/c7/4979c79831b572748c793abb9b4c0fd5.js' },
  { id: 'socialbar', script: 'https://screwbedriddenheadline.com/57/90/36/579036b82851aedb5daf37582017d3dd.js' },
]

const NATIVE_AD = {
  id: 'ad-native',
  script: 'https://screwbedriddenheadline.com/f836111d03e67511699794e1cfe4071e/invoke.js',
  container: 'container-f836111d03e67511699794e1cfe4071e',
}

// ─── Load global (popunder + socialbar) sekali per mount ───
export function loadGlobalAds() {
  if (typeof window === 'undefined') return
  GLOBAL_ADS.forEach((ad) => {
    if (document.querySelector(`script[data-adsterra-global="${ad.id}"]`)) return
    const script = document.createElement('script')
    script.src = ad.script
    script.async = true
    script.dataset.adsterraGlobal = ad.id
    document.body.appendChild(script)
  })
}

// ─── Banner ad — via IFRAME ke /ads/<format> (isolated atOptions) ───
export function AdBanner({ format = '300x250', className = '' }: { format?: '300x250' | '728x90' | '320x50' | '160x600' | '160x300'; className?: string }) {
  const sizes: Record<string, { width: number; height: number }> = {
    '300x250': { width: 300, height: 250 },
    '728x90': { width: 728, height: 90 },
    '320x50': { width: 320, height: 50 },
    '160x600': { width: 160, height: 600 },
    '160x300': { width: 160, height: 300 },
  }
  const size = sizes[format] || sizes['300x250']

  return (
    <div className={`flex justify-center items-center overflow-hidden ${className}`} style={{ width: size.width, maxWidth: '100%', height: size.height }}>
      <iframe
        src={`/ads/${format}`}
        title={`Iklan ${format}`}
        width={size.width}
        height={size.height}
        scrolling="no"
        frameBorder="0"
        style={{ border: 0, overflow: 'hidden' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}

// ─── Native banner (4 gambar sebaris) — via iframe dari route /ads/native ───
export function NativeAd({ className = '' }: { className?: string }) {
  return (
    <div className={`native-ad-container w-full ${className}`}>
      <iframe
        src="/ads/native"
        title="Iklan native"
        width="100%"
        height="250"
        scrolling="no"
        frameBorder="0"
        style={{ border: 0, overflow: 'hidden', minHeight: '250px' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}

// ─── Smartlink (redirect traffic) ───
export const SMARTLINK_URL = 'https://screwbedriddenheadline.com/gykqezh0?key=2203436cee25e3a484d40b06938ae0ba'

// ─── Main component: global ads di seluruh app ───
export default function AdsterraAds() {
  useEffect(() => {
    loadGlobalAds()
    // JANGAN cleanup di unmount — popunder/socialbar harus persist
  }, [])
  return null
}
'use client'
import { useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Adsterra ads — ALL FORMATS (dari dashboard zenflix-ten.vercel.app)
//
// CATATAN PENTING:
// Setiap banner Adsterra butuh `atOptions` TEPAT SEBELUM invoke.js di-render.
// atOptions harus UNIK per banner (ga boleh global — nanti collide & cuma 1 jalan).
// Solusi: render inline script per banner dalam container sendiri.
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

// ─── Banner ad — inject inline atOptions + invoke.js per container ───
export function AdBanner({ format = '300x250', className = '' }: { format?: '300x250' | '728x90' | '320x50' | '160x600' | '160x300'; className?: string }) {
  const bannerRef = useRef<HTMLDivElement>(null)

  const ADS: Record<string, { key: string; height: number; width: number }> = {
    '300x250': { key: 'cdb082b17c5df3a8f55b78809456670e', height: 250, width: 300 },
    '728x90': { key: '0d1d255404797f2740a022e177c002c1', height: 90, width: 728 },
    '320x50': { key: '86d2ab14ab08340477ebc8df939a317e', height: 50, width: 320 },
    '160x600': { key: '6184e534558879dbca8e994f1061186d', height: 600, width: 160 },
    '160x300': { key: '0afe199db21edbe0550b414c3549d9c5', height: 300, width: 160 },
  }
  const ad = ADS[format] || ADS['300x250']

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    // Skip kalau sudah ada
    if (el.querySelector('script[data-adsterra-banner]')) return

    // INLINE atOptions + invoke.js — unik per container (no global collision)
    const inline = document.createElement('script')
    inline.type = 'text/javascript'
    inline.textContent = `atOptions = { 'key': '${ad.key}', 'format': 'iframe', 'height': ${ad.height}, 'width': ${ad.width}, 'params': {} };`
    el.appendChild(inline)

    const invoke = document.createElement('script')
    invoke.src = `https://screwbedriddenheadline.com/${ad.key}/invoke.js`
    invoke.async = true
    invoke.dataset.adsterraBanner = ad.key
    el.appendChild(invoke)

    return () => {
      el.querySelectorAll('script[data-adsterra-banner], script[data-adsterra-inline]').forEach((s) => s.remove())
    }
  }, [ad.key, ad.height, ad.width])

  return (
    <div ref={bannerRef} className={`flex justify-center items-center overflow-hidden ${className}`} style={{ minHeight: ad.height, maxWidth: ad.width }} data-adsterra-format={format} />
  )
}

// ─── Native banner (4 gambar sebaris) ───
export function NativeAd({ className = '' }: { className?: string }) {
  const nativeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = nativeRef.current
    if (!el) return
    if (el.querySelector(`script[data-adsterra-native]`)) return
    const script = document.createElement('script')
    script.src = NATIVE_AD.script
    script.async = true
    script.dataset.adsterraNative = 'true'
    el.appendChild(script)
    return () => {
      el.querySelectorAll('script[data-adsterra-native]').forEach((s) => s.remove())
    }
  }, [])

  return (
    <div ref={nativeRef} className={`native-ad-container ${className}`}>
      <div id={NATIVE_AD.container} />
    </div>
  )
}

// ─── Smartlink (redirect traffic) ───
export const SMARTLINK_URL = 'https://screwbedriddenheadline.com/gykqezh0?key=2203436cee25e3a484d40b06938ae0ba'

// ─── Main component: global ads di seluruh app ───
export default function AdsterraAds() {
  useEffect(() => {
    loadGlobalAds()
    // JANGAN cleanup di unmount — popunder/socialbar harus persist (ga numpuk karena guard querySelector)
  }, [])
  return null
}
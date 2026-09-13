'use client'
import { useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Adsterra ads — SEMUA FORMAT (dari dashboard zenflix-ten.vercel.app)
// 
// Format:
// - Popunder (anti-adblock): tab/background baru saat user click/interaksi
// - SocialBar (anti-adblock): bar sosial bawah
// - 300x250: banner kotak (sidebar/antar konten)
// - 728x90: leaderboard (atas konten)
// - 320x50: mobile banner
// - 160x600: skyscraper (sidebar)
// - NativeBanner: 4 gambar sebaris (inline konten)
// - Smartlink: redirect mobile traffic
// 
// Semua script via screwbedriddenheadline.com (anti-adblock CDN)
// ═══════════════════════════════════════════════════════════════════

const BANNER_ADS = [
  { id: 'ad-300x250', script: 'https://screwbedriddenheadline.com/cdb082b17c5df3a8f55b78809456670e/invoke.js', atOptions: { key: 'cdb082b17c5df3a8f55b78809456670e', format: 'iframe', height: 250, width: 300 } },
  { id: 'ad-728x90', script: 'https://screwbedriddenheadline.com/0d1d255404797f2740a022e177c002c1/invoke.js', atOptions: { key: '0d1d255404797f2740a022e177c002c1', format: 'iframe', height: 90, width: 728 } },
  { id: 'ad-320x50', script: 'https://screwbedriddenheadline.com/86d2ab14ab08340477ebc8df939a317e/invoke.js', atOptions: { key: '86d2ab14ab08340477ebc8df939a317e', format: 'iframe', height: 50, width: 320 } },
  { id: 'ad-160x600', script: 'https://screwbedriddenheadline.com/6184e534558879dbca8e994f1061186d/invoke.js', atOptions: { key: '6184e534558879dbca8e994f1061186d', format: 'iframe', height: 600, width: 160 } },
  { id: 'ad-160x300', script: 'https://screwbedriddenheadline.com/0afe199db21edbe0550b414c3549d9c5/invoke.js', atOptions: { key: '0afe199db21edbe0550b414c3549d9c5', format: 'iframe', height: 300, width: 160 } },
]

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
  const loaded = new Set<string>()
  GLOBAL_ADS.forEach((ad) => {
    if (loaded.has(ad.id) || document.querySelector(`script[data-adsterra-global="${ad.id}"]`)) return
    loaded.add(ad.id)
    const script = document.createElement('script')
    script.src = ad.script
    script.async = true
    script.dataset.adsterraGlobal = ad.id
    document.body.appendChild(script)
  })
}

// ─── Banner ad component (renders one format) ───
export function AdBanner({ format = '300x250', className = '' }: { format?: '300x250' | '728x90' | '320x50' | '160x600' | '160x300'; className?: string }) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const ad = BANNER_ADS.find((a) => a.id.includes(format)) || BANNER_ADS[0]

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    // Skip kalau sudah ada
    if (el.querySelector('iframe, script[data-adsterra-banner]')) return

    // atOptions global (dibaca invoke.js)
    try {
      ;(window as any).atOptions = { ...ad.atOptions }
    } catch {}
    const script = document.createElement('script')
    script.src = ad.script
    script.async = true
    script.dataset.adsterraBanner = ad.id
    el.appendChild(script)

    return () => {
      el.querySelectorAll('script[data-adsterra-banner], iframe[src*="screwbedriddenheadline"]').forEach((s) => s.remove())
    }
  }, [ad])

  return (
    <div ref={bannerRef} className={`flex justify-center items-center overflow-hidden ${className}`} style={{ minHeight: ad.atOptions.height, maxWidth: ad.atOptions.width }} data-adsterra-format={format} />
  )
}

// ─── Native banner (4 gambar sebaris) ───
export function NativeAd({ className = '' }: { className?: string }) {
  const nativeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = nativeRef.current
    if (!el) return
    if (document.querySelector(`script[data-adsterra-native]`)) return
    const script = document.createElement('script')
    script.src = NATIVE_AD.script
    script.async = true
    script.dataset.adsterraNative = 'true'
    el.appendChild(script)
    return () => {
      el.querySelectorAll('script[data-adsterra-native], #container-f836111d03e67511699794e1cfe4071e').forEach((s) => s.remove())
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
    return () => {
      document.querySelectorAll('script[data-adsterra-global]').forEach((s) => s.remove())
    }
  }, [])
  return null
}
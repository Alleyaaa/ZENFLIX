import { NextRequest, NextResponse } from 'next/server'

// Banner Adsterra — tiap banner atOptions unik di endpoint ini
// Dipanggil via <iframe src="/ads/300x250" ...> di halaman
// Hindari collision window.atOptions global

interface AdConfig {
  key: string
  format: string
  height: number
  width: number
}

const AD_CONFIGS: Record<string, { key: string; format: string; height: number; width: number }> = {
  '300x250': { key: 'cdb082b17c5df3a8f55b78809456670e', format: 'iframe', height: 250, width: 300 },
  '728x90': { key: '0d1d255404797f2740a022e177c002c1', format: 'iframe', height: 90, width: 728 },
  '320x50': { key: '86d2ab14ab08340477ebc8df939a317e', format: 'iframe', height: 50, width: 320 },
  '160x600': { key: '6184e534558879dbca8e994f1061186d', format: 'iframe', height: 600, width: 160 },
  '160x300': { key: '0afe199db21edbe0550b414c3549d9c5', format: 'iframe', height: 300, width: 160 },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || '300x250'
  const config = AD_CONFIGS[format] || { key: '', format: 'iframe', height: 250, width: 300 }

  // Render HTML page dengan atOptions unik + script Adsterra
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
  <script>
    atOptions = {
      'key': '${AD_CONFIGS[format]?.key || ''}',
      'format': 'iframe',
      'height': ${AD_CONFIGS[format]?.height || 250},
      'width': ${AD_CONFIGS[format]?.width || 300},
      'params': {}
    };
  </script>
  <script src="https://screwbedriddenheadline.com/${format.includes('300x250') ? 'cdb082b17c5df3a8f55b78809456670e' : format === '728x90' ? '0d1d255404797f2740a022e177c002c1' : format === '320x50' ? '86d2ab14ab08340477ebc8df939a317e' : format === '160x600' ? '6184e534558879dbca8e994f1061186d' : '0afe199db21edbe0550b414c3549d9c5'}/invoke.js" async></script>
</head>
<body style="margin:0;padding:0;">
  <div id="adsterra-banner" style="width:100%;height:100%;">
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self' https://zenflix-ten.vercel.app; script-src 'self' 'unsafe-inline' https://screwbedriddenheadline.com; frame-src 'self' https://screwbedriddenheadline.com;"
    }
  })
}
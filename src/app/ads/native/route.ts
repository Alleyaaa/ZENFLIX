import { NextResponse } from 'next/server'

// Native Adsterra — 4 gambar sebaris, di-render isolated via iframe
export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; background: transparent; }
  </style>
  <script async="async" data-cfasync="false" src="https://screwbedriddenheadline.com/f836111d03e67511699794e1cfe4071e/invoke.js"></script>
</head>
<body>
  <div id="container-f836111d03e67511699794e1cfe4071e"></div>
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
'use client'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/next'

// Vercel Analytics — pantau pengunjung & page views
export default function VercelAnalytics() {
  return <Analytics />
}
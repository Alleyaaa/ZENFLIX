// Sentry client configuration
import * as Sentry from '@sentry/nextjs'

export function initSentryClient() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'production',
  })
}
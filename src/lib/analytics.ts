// Anonymous, cookie-less, identifier-free events (DEC-006, REQ-008).
// Provider is not chosen yet: set VITE_ANALYTICS_URL to an aggregation endpoint. Unset or failing => dropped silently.
export type AnalyticsEvent =
  | { type: 'view'; topic?: string; page: string }
  | { type: 'answer'; topic: string; question: string; correct: boolean }
  | { type: 'simulation'; passed: boolean }

export function track(e: AnalyticsEvent) {
  const url = import.meta.env.VITE_ANALYTICS_URL as string | undefined
  if (!url) return
  try {
    const body = JSON.stringify(e)
    if (!navigator.sendBeacon?.(url, body)) fetch(url, { method: 'POST', body, keepalive: true, credentials: 'omit' }).catch(() => {})
  } catch { /* never affect learning */ }
}

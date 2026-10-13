// Client for the Rust API gateway (backend/rust-api).
//
// The site stays deployable as a static bundle: when no gateway is configured
// (or it is not answering) every helper here reports "unavailable" and callers
// fall back to their browser-side data source. Set VITE_API_BASE_URL to the
// gateway origin — the `/api` prefix is added automatically.

const configured = (import.meta.env.VITE_API_BASE_URL || '').trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

// Default to the local gateway during `vite dev`, off in production builds.
export const API_BASE = configured || (import.meta.env.DEV ? 'http://127.0.0.1:8080' : '')
export const API_ENABLED = Boolean(API_BASE)

const HEALTH_TTL = 30_000
const DEFAULT_TIMEOUT = 8000

/** Thrown when the gateway is disabled or not answering. */
export class ApiUnavailable extends Error {
  constructor(message = 'API gateway unavailable') {
    super(message)
    this.name = 'ApiUnavailable'
  }
}

let health = { checkedAt: 0, ok: false }

/** Absolute URL for an API path, e.g. `apiUrl('/health')`. */
export function apiUrl(path) {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}/api${clean}`
}

async function request(path, { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(apiUrl(path), {
      method,
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    const text = await response.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }

    if (!response.ok) {
      const detail = data?.error?.message ?? data?.detail
      const message =
        typeof detail === 'string' ? detail : `${response.status} ${response.statusText}`
      const error = new Error(message)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } finally {
    clearTimeout(timer)
  }
}

/** Whether the gateway is reachable, cached briefly to avoid probing per call. */
export async function apiHealthy({ force = false } = {}) {
  if (!API_ENABLED) return false
  if (!force && Date.now() - health.checkedAt < HEALTH_TTL) return health.ok

  try {
    await request('/health', { timeoutMs: 1500 })
    health = { checkedAt: Date.now(), ok: true }
  } catch {
    health = { checkedAt: Date.now(), ok: false }
  }
  return health.ok
}

/**
 * GET an API path. Returns the parsed body, or `null` when the gateway is
 * disabled, unreachable, or answered with an error — callers then fall back.
 */
export async function apiGet(path, options = {}) {
  if (!(await apiHealthy())) return null
  try {
    return await request(path, options)
  } catch (error) {
    console.warn(`[api] GET ${path} failed:`, error.message)
    return null
  }
}

/**
 * POST an API path. Returns the parsed body, or `null` when the gateway is
 * unavailable so the caller can fall back to another delivery path.
 */
export async function apiPost(path, body, options = {}) {
  if (!(await apiHealthy())) return null
  try {
    return await request(path, { ...options, method: 'POST', body })
  } catch (error) {
    if (error.status >= 400 && error.status < 500) {
      // A rejection we should surface (e.g. validation failure).
      throw error
    }
    console.warn(`[api] POST ${path} failed:`, error.message)
    return null
  }
}

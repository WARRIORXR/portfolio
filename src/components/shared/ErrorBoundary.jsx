import { Component } from 'react'

const RELOAD_FLAG = 'app:chunk-reload'
const RELOAD_TTL = 10_000

/**
 * True when an error comes from a dynamic import of a build chunk that no
 * longer exists on the server — the classic stale-deploy failure after a new
 * production build goes live (or a stale PWA service worker serving old HTML).
 */
function isChunkLoadError(error) {
  const msg = String(error?.message || error || '')
  return (
    /failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /chunkloaderror/i.test(msg) ||
    /loading chunk \d+ failed/i.test(msg)
  )
}

/**
 * One-shot recovery: reload the page once so the browser picks up the fresh
 * deployment. Guarded by a sessionStorage flag + TTL so we never reload-loop
 * when the site is genuinely broken.
 */
function reloadForFreshAssets() {
  try {
    const prev = sessionStorage.getItem(RELOAD_FLAG)
    if (prev && Date.now() - Number(prev) < RELOAD_TTL) return false
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
    window.location.reload()
    return true
  } catch {
    return false
  }
}

/**
 * Catches render errors anywhere below it. Chunk-load failures trigger a
 * single automatic reload; everything else renders a minimal fallback card
 * so a broken section can never take the whole site down to a black screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    if (this.props.silent) return
    if (isChunkLoadError(error) && reloadForFreshAssets()) return
    // Surface non-chunk errors for debugging without crashing the app.
    console.error('[ErrorBoundary]', error)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div
        role="alert"
        className="mx-auto my-10 max-w-md rounded-xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center"
      >
        <p className="mono-label mb-2 text-white/40">Something went wrong</p>
        <p className="text-sm text-white/60">
          This section failed to load. A refresh usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-85"
        >
          Reload
        </button>
      </div>
    )
  }
}

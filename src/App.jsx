import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ScrollProgress from './components/shared/ScrollProgress'
import { initEmailJS } from './lib/emailjs'

// Lazy-load the heavy Three.js hero for a clean bundle split
const HorizonHero = lazy(() =>
  import('./components/ui/horizon-hero-section').then((m) => ({ default: m.Component }))
)

function HeroFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tighter">HORIZON</div>
      <p className="mt-6 mono-label">Loading…</p>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    initEmailJS()
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
      <ScrollProgress />
      <Navbar />

      {/* Horizon Three.js hero — full-page cinematic opener (300vh) */}
      <Suspense fallback={<HeroFallback />}>
        <HorizonHero />
      </Suspense>

      <div className="relative z-10 bg-black">
        <main>
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  )
}

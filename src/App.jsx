import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ScrollProgress from './components/shared/ScrollProgress'
import { initEmailJS } from './lib/emailjs'

// Lazy-load the Three.js hero so bundle splits cleanly
const HorizonHero = lazy(() =>
  import('./components/ui/horizon-hero-section').then((m) => ({ default: m.Component }))
)

function HeroFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-4">
        <div className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white">
          HORIZON
        </div>
        <p className="text-xs sm:text-sm font-mono tracking-[0.3em] text-white/40 uppercase">
          INITIALIZING CELESTIAL ENVIRONMENT...
        </p>
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    initEmailJS()
  }, [])

  return (
    <div className="relative text-white min-h-screen bg-black selection:bg-white/20 selection:text-white">
      <ScrollProgress />
      <Navbar />

      {/* Horizon Three.js Hero — full-page cinematic opener (300vh) */}
      <Suspense fallback={<HeroFallback />}>
        <HorizonHero />
      </Suspense>

      {/* Portfolio sections below the hero */}
      <div
        className="relative z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(12, 18, 48, 0.85) 0%, rgba(0, 0, 0, 0.97) 50%, #000000 100%)',
        }}
      >
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

import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ScrollProgress from './components/shared/ScrollProgress'
import { initEmailJS } from './lib/emailjs'

// Lazy-load the heavy Three.js hero so the rest of the app loads fast
const HorizonHero = lazy(() =>
  import('./components/ui/horizon-hero-section').then((m) => ({ default: m.Component }))
)

function HeroFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="text-8xl font-black text-white mb-4 tracking-tighter">HORIZON</div>
        <p className="text-white/40 text-sm tracking-widest uppercase">Loading experience...</p>
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => { initEmailJS() }, [])

  return (
    <div className="relative text-white" style={{ background: '#000' }}>
      <ScrollProgress />

      {/* Horizon Three.js Hero — full-page cinematic opener (300vh) */}
      <Suspense fallback={<HeroFallback />}>
        <HorizonHero />
      </Suspense>

      {/* Portfolio sections below the hero */}
      <div
        className="relative z-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <Navbar />
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

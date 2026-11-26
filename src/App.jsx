import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import { ThemeProvider } from './context/ThemeContext'

const About = lazy(() => import('./components/sections/About'))
const Skills = lazy(() => import('./components/sections/Skills'))
const Projects = lazy(() => import('./components/sections/Projects'))
const Footer = lazy(() => import('./components/layout/Footer'))
const CommandPalette = lazy(() => import('./components/ui/CommandPalette'))

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteMounted, setPaletteMounted] = useState(false)
  const [projectTab, setProjectTab] = useState('featured')

  const openPalette = () => {
    setPaletteMounted(true)
    setPaletteOpen(true)
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteMounted(true)
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[#faf9f6] text-[#0e1422] dark:bg-[#09090b] dark:text-[#f4f4f5] selection:bg-emerald-500/20 selection:text-inherit font-sans antialiased transition-colors duration-300">
        {/* Continuous soft multi-hue ambient backdrop binding sections together */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -top-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-32 right-[-8%] h-[460px] w-[460px] rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[25%] h-[420px] w-[520px] rounded-full bg-violet-400/10 dark:bg-violet-500/10 blur-[130px]" />
        </div>

        <Navbar onOpenCommand={openPalette} />

        <main className="relative z-10">
          <Hero
            onJumpToLab={() => {
              setProjectTab('featured')
              window.setTimeout(() => {
                ;(document.getElementById('data-lab') || document.getElementById('projects'))?.scrollIntoView({ behavior: 'smooth' })
              }, 80)
            }}
          />

          <Suspense fallback={<div id="about" className="min-h-[420px] scroll-mt-24" />}>
            <About />
          </Suspense>

          <Suspense fallback={<div id="skills" className="min-h-[380px] scroll-mt-24" />}>
            <Skills />
          </Suspense>

          <Suspense fallback={<div id="projects" className="min-h-[520px] scroll-mt-24" />}>
            <Projects activeTab={projectTab} onTabChange={setProjectTab} />
          </Suspense>
        </main>

        <div className="relative z-10">
          <Suspense fallback={<div id="footer" className="min-h-[260px]" />}>
            <Footer />
          </Suspense>
        </div>

        {paletteMounted && (
          <Suspense fallback={null}>
            <CommandPalette
              open={paletteOpen}
              onClose={() => setPaletteOpen(false)}
              onSwitchProjectTab={setProjectTab}
            />
          </Suspense>
        )}
      </div>
    </ThemeProvider>
  )
}

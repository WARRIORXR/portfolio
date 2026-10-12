import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ScrollProgress from './components/shared/ScrollProgress'
import { initEmailJS } from './lib/emailjs'

export default function App() {
  useEffect(() => {
    initEmailJS()
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import ScrollProgress from './components/shared/ScrollProgress'
import { ThemeProvider } from './context/ThemeContext'
import { initEmailJS } from './lib/emailjs'

export default function App() {
  useEffect(() => {
    initEmailJS()
  }, [])

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[#fafafa] text-slate-900 dark:bg-black dark:text-white selection:bg-blue-500/20 selection:text-inherit font-sans antialiased transition-colors duration-300">
        <ScrollProgress />
        <Navbar />

        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

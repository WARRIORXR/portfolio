import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { FaGithub, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa'
import ParticleBackground from '../shared/ParticleBackground'
import GlassButton from '../ui/GlassButton'
import GlassCard from '../ui/GlassCard'
import { personalInfo } from '../../data/personalInfo'

const floatingIcons = ['🐍', '🤖', '📊', '🧠', '⚡', '🔬']

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticleBackground />

      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating tech icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none hidden lg:block"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
        >
          <span className="text-3xl opacity-20">{icon}</span>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Greeting badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full
            bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-mono"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Available for AI/ML Internships & Roles
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-transparent">
            Tanish
          </span>
          <br />
          <span
            className="bg-clip-text text-transparent animate-gradient-x"
            style={{ backgroundImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)', backgroundSize: '200% auto' }}
          >
            Jaswal
          </span>
        </motion.h1>

        {/* Typing animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/70 mb-3 font-mono h-8"
        >
          <TypeAnimation
            sequence={[
              'Python Developer', 2000,
              'ML Engineer', 2000,
              'AI Enthusiast', 2000,
              'Flask Developer', 2000,
              'Deep Learning Explorer', 2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="text-blue-300"
          />
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-white/40 text-sm mb-10"
        >
          <FaMapMarkerAlt className="text-blue-400" />
          Punjab, India · B.Tech CSE @ IKGPTU (2027)
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <GlassButton onClick={() => scrollTo('projects')} variant="primary" size="lg" icon="🚀">
            View Projects
          </GlassButton>
          <GlassButton href={personalInfo.resume} download variant="secondary" size="lg" icon="📄">
            Download Resume
          </GlassButton>
          <GlassButton href={personalInfo.github} target="_blank" variant="outline" size="lg">
            <FaGithub /> GitHub
          </GlassButton>
        </motion.div>

        {/* Stats glass card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard padding={false} className="inline-block" hover={false}>
            <div className="flex divide-x divide-white/10">
              {[
                { value: '6', label: 'Week Internship', icon: '💼' },
                { value: '2+', label: 'Projects Built', icon: '🛠️' },
                { value: '10+', label: 'ML Algorithms', icon: '🤖' },
                { value: '15+', label: 'Skills', icon: '⚡' },
              ].map((s) => (
                <div key={s.label} className="px-6 py-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/40 whitespace-nowrap">{s.label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex flex-col items-center gap-2 text-white/30 text-xs"
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1"
          >
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

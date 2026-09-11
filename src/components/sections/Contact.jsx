import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Radio,
  Terminal,
  ArrowUpRight,
} from 'lucide-react'
import { Github, Linkedin } from '../ui/BrandIcons'
import toast, { Toaster } from 'react-hot-toast'
import GlassCard from '../ui/GlassCard'
import GlassButton from '../ui/GlassButton'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'
import { sendContactEmail } from '../../lib/emailjs'

const INITIAL = { name: '', email: '', subject: '', message: '' }
const ERRORS_INIT = { name: '', email: '', subject: '', message: '' }

function validate(fields) {
  const e = { ...ERRORS_INIT }
  if (!fields.name.trim()) e.name = 'NAME REQUIRED'
  if (!fields.email.trim()) e.email = 'EMAIL REQUIRED'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'INVALID FORMAT'
  if (!fields.subject.trim()) e.subject = 'SUBJECT REQUIRED'
  if (!fields.message.trim()) e.message = 'MESSAGE REQUIRED'
  else if (fields.message.trim().length < 15) e.message = 'MINIMUM 15 CHARACTERS REQUIRED'
  return e
}

function Field({ label, id, type = 'text', rows, value, onChange, error, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[10px] font-mono tracking-widest text-white/50 uppercase"
        >
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-mono text-rose-400 tracking-wider uppercase">
            {error}
          </span>
        )}
      </div>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white text-xs font-mono placeholder-white/20 outline-none transition-all resize-none ${
            error
              ? 'border-rose-500/50 focus:border-rose-500'
              : 'border-white/10 focus:border-white/40 focus:bg-white/[0.04]'
          }`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white text-xs font-mono placeholder-white/20 outline-none transition-all ${
            error
              ? 'border-rose-500/50 focus:border-rose-500'
              : 'border-white/10 focus:border-white/40 focus:bg-white/[0.04]'
          }`}
        />
      )}
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState(ERRORS_INIT)
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      await sendContactEmail(form)
      toast.success('TRANSMISSION RECEIVED &middot; DISPATCHING RESPONSE SHORTLY', {
        style: {
          background: '#000',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      })
      setForm(INITIAL)
    } catch {
      toast.error('TRANSMISSION FAILED &middot; DIRECT EMAIL RECOMMENDED', {
        style: {
          background: '#000',
          color: '#fff',
          border: '1px solid rgba(255,50,50,0.4)',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const socials = [
    {
      icon: Github,
      name: 'GITHUB',
      handle: '@WARRIORXR',
      href: personalInfo.github,
    },
    {
      icon: Linkedin,
      name: 'LINKEDIN',
      handle: 'tanish-jaswal-9b49b3370',
      href: personalInfo.linkedin,
    },
    {
      icon: Mail,
      name: 'EMAIL',
      handle: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
  ]

  return (
    <SectionWrapper id="contact">
      <Toaster position="top-right" />
      <SectionTitle
        label="// 04 · TRANSMISSION LINK"
        title="COMMUNICATIONS"
        subtitle="DIRECT DISPATCH TERMINAL FOR RECRUITMENT, RESEARCH & COLLABORATION"
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Telemetry Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SectionItem>
            <GlassCard glowColor="rgba(0,51,255,0.25)">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-mono tracking-[0.2em] text-white/50 uppercase">
                  ACTIVE FREQUENCY
                </span>
              </div>
              <h3 className="text-xl font-mono font-bold text-white mb-3 tracking-wide">
                INITIATE CONTACT
              </h3>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
                Available for full-time entry AI/ML Engineer roles, machine learning research internships,
                and high-impact Python software projects.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-3 p-3 rounded border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="w-7 h-7 rounded bg-white/[0.05] flex items-center justify-center text-white/80">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-white/40 uppercase">Email Address</div>
                    <div className="text-white truncate group-hover:text-blue-300 transition-colors">
                      {personalInfo.email}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white" />
                </a>

                <div className="flex items-center gap-3 p-3 rounded border border-white/10 bg-white/[0.02]">
                  <div className="w-7 h-7 rounded bg-white/[0.05] flex items-center justify-center text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase">Location & Zone</div>
                    <div className="text-white">{personalInfo.location} &middot; IST (UTC+5:30)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded border border-white/10 bg-white/[0.02]">
                  <div className="w-7 h-7 rounded bg-white/[0.05] flex items-center justify-center text-white/80">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase">Direct Wire</div>
                    <div className="text-white">{personalInfo.phone}</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </SectionItem>

          {/* Social Links Network */}
          <SectionItem>
            <GlassCard>
              <span className="block text-[10px] font-mono tracking-widest uppercase text-white/40 mb-3">
                SYSTEM INTERFACES
              </span>
              <div className="grid gap-2">
                {socials.map(({ icon: Icon, name, handle, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/30 transition-all font-mono group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white tracking-wider">{name}</div>
                        <div className="text-[10px] text-white/40 truncate">{handle}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white shrink-0" />
                  </a>
                ))}
              </div>
            </GlassCard>
          </SectionItem>
        </div>

        {/* Right Form Terminal (7 cols) */}
        <SectionItem className="lg:col-span-7">
          <GlassCard glowColor="rgba(0,51,255,0.2)">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-white uppercase">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>DISPATCH CONSOLE</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">ENC: TLS 1.3</span>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="AGENT NAME"
                  id="name"
                  value={form.name}
                  onChange={update('name')}
                  error={errors.name}
                  placeholder="Your Name / Organization"
                />
                <Field
                  label="CONTACT FREQUENCY (EMAIL)"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  error={errors.email}
                  placeholder="contact@domain.com"
                />
              </div>

              <Field
                label="TRANSMISSION SUBJECT"
                id="subject"
                value={form.subject}
                onChange={update('subject')}
                error={errors.subject}
                placeholder="Subject: Opportunity / Collaboration / Inquiry"
              />

              <Field
                label="DISPATCH PAYLOAD (MESSAGE)"
                id="message"
                rows={5}
                value={form.message}
                onChange={update('message')}
                error={errors.message}
                placeholder="Details of inquiry or project requirements..."
              />

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<Send className="w-4 h-4" />}
                >
                  DISPATCH TRANSMISSION
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </SectionItem>
      </div>
    </SectionWrapper>
  )
}

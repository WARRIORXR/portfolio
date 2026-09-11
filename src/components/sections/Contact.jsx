import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
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
  if (!fields.name.trim()) e.name = 'Name is required'
  if (!fields.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Invalid email address'
  if (!fields.subject.trim()) e.subject = 'Subject is required'
  if (!fields.message.trim()) e.message = 'Message is required'
  else if (fields.message.trim().length < 20) e.message = 'Message must be at least 20 characters'
  return e
}

function Field({ label, id, type = 'text', rows, value, onChange, error, placeholder }) {
  const base = `w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-white/30
    focus:outline-none focus:ring-2 transition-all duration-200 ${
      error
        ? 'border-red-500/50 focus:ring-red-500/30'
        : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 hover:border-white/20'
    }`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-1.5">
        {label}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} value={value} onChange={onChange} placeholder={placeholder} className={`${base} resize-none`} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} className={base} />
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
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
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return }

    setLoading(true)
    try {
      await sendContactEmail(form)
      toast.success('Message sent! I\'ll get back to you soon. 🚀', { duration: 5000 })
      setForm(INITIAL)
    } catch {
      toast.error('Failed to send message. Please email me directly.', { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const socials = [
    { icon: FaGithub, href: personalInfo.github, label: 'GitHub', color: '#6b7280' },
    { icon: FaLinkedin, href: personalInfo.linkedin, label: 'LinkedIn', color: '#0ea5e9' },
    { icon: FaEnvelope, href: `mailto:${personalInfo.email}`, label: 'Email', color: '#3b82f6' },
  ]

  return (
    <SectionWrapper id="contact">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <SectionTitle label="// Get In Touch" title="Contact Me" />

      <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
        {/* Left — Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <SectionItem>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Let's Connect</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                I'm actively seeking AI/ML internship and entry-level AI Engineer roles. 
                Whether you have an opportunity, a project idea, or just want to connect — I'd love to hear from you!
              </p>
              <div className="space-y-3">
                {[
                  { icon: FaEnvelope, text: personalInfo.email, href: `mailto:${personalInfo.email}`, color: '#3b82f6' },
                  { icon: FaMapMarkerAlt, text: personalInfo.location, color: '#8b5cf6' },
                  { icon: FaPhone, text: personalInfo.phone, color: '#06b6d4' },
                ].map(({ icon: Icon, text, href, color }) => (
                  <div key={text} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon style={{ color }} size={14} />
                    </div>
                    {href ? (
                      <a href={href} className="text-white/70 text-sm hover:text-white transition-colors">{text}</a>
                    ) : (
                      <span className="text-white/70 text-sm">{text}</span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </SectionItem>

          <SectionItem>
            <GlassCard>
              <h4 className="text-sm font-semibold text-white/70 mb-3">Find me on</h4>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, href, label, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all duration-200"
                    style={{ background: `${color}10`, borderColor: `${color}30` }}
                    aria-label={label}
                  >
                    <Icon size={20} style={{ color }} />
                    <span className="text-xs text-white/50">{label}</span>
                  </motion.a>
                ))}
              </div>
            </GlassCard>
          </SectionItem>
        </div>

        {/* Right — Form */}
        <SectionItem className="lg:col-span-3">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-5">Send a Message</h3>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Your Name" id="name" value={form.name}
                  onChange={update('name')} error={errors.name}
                  placeholder="John Doe"
                />
                <Field
                  label="Email Address" id="email" type="email" value={form.email}
                  onChange={update('email')} error={errors.email}
                  placeholder="john@example.com"
                />
              </div>
              <Field
                label="Subject" id="subject" value={form.subject}
                onChange={update('subject')} error={errors.subject}
                placeholder="Internship Opportunity / Collaboration..."
              />
              <Field
                label="Message" id="message" rows={5} value={form.message}
                onChange={update('message')} error={errors.message}
                placeholder="Hi Tanish, I'd like to discuss..."
              />
              <GlassButton
                type="submit" loading={loading} variant="primary"
                className="w-full justify-center" size="lg" icon="✉️"
              >
                Send Message
              </GlassButton>
            </form>
          </GlassCard>
        </SectionItem>
      </div>
    </SectionWrapper>
  )
}

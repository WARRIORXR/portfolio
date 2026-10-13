import { useState } from 'react'
import { Send, Loader2, Mail, ArrowUpRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Github, Linkedin, Whatsapp } from '../ui/BrandIcons'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'
import { sendContactEmail } from '../../lib/emailjs'
import { composeMessage, gmailComposeUrl, handleFromUrl, whatsappUrl } from '../../lib/links'

const INITIAL = { name: '', email: '', subject: '', message: '' }

// Direct channels — Gmail compose and WhatsApp deep links derived from the
// shared profile, so the address and number live in exactly one place.
const channels = [
  { label: 'Gmail', icon: Mail, value: personalInfo.email, href: gmailComposeUrl() },
  { label: 'WhatsApp', icon: Whatsapp, value: personalInfo.phone, href: whatsappUrl() },
  { label: 'GitHub', icon: Github, value: handleFromUrl(personalInfo.github), href: personalInfo.github },
  { label: 'LinkedIn', icon: Linkedin, value: handleFromUrl(personalInfo.linkedin), href: personalInfo.linkedin },
]

function validate(fields) {
  const e = {}
  if (!fields.name.trim()) e.name = 'Name is required'
  if (!fields.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Invalid email format'
  if (!fields.subject.trim()) e.subject = 'Subject is required'
  if (!fields.message.trim()) e.message = 'Message is required'
  else if (fields.message.trim().length < 15) e.message = 'Minimum 15 characters'
  return e
}

function Field({ label, id, type = 'text', rows, value, onChange, error, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="mono-label text-[10px]">
          {label}
        </label>
        {error && <span className="text-[11px] text-rose-400/90">{error}</span>}
      </div>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-line ${error ? 'error' : ''}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-line ${error ? 'error' : ''}`}
        />
      )}
    </div>
  )
}

export default function Contact() {
  const [fields, setFields] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const set = (key) => (ev) => {
    setFields((f) => ({ ...f, [key]: ev.target.value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate(fields)
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setSending(true)
    try {
      await sendContactEmail(fields)
      toast.success("Message sent — I'll get back to you soon.")
      setFields(INITIAL)
    } catch {
      toast.error('Failed to send. Please try again or email me directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <SectionWrapper id="contact">
      <SectionTitle
        index="04"
        label="Contact"
        title="Let's build something."
        subtitle="Open to AI/ML internships and entry-level roles — or just a conversation about what you're working on."
      />

      <div className="grid gap-14 md:grid-cols-5 md:gap-16">
        {/* Info */}
        <div className="md:col-span-2 space-y-8">
          <SectionItem>
            <div className="flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {channels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-3.5 text-sm"
                >
                  <span className="flex shrink-0 items-center gap-3 text-white/40">
                    <channel.icon className="w-4 h-4" />
                    {channel.label}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 text-white/70 group-hover:text-white transition-colors">
                    <span className="truncate">{channel.value}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </a>
              ))}
            </div>
          </SectionItem>

          <SectionItem>
            <p className="text-sm leading-relaxed text-white/40">
              Based in {personalInfo.location}. Usually reply within a day.
            </p>
          </SectionItem>
        </div>

        {/* Form */}
        <SectionItem className="md:col-span-3">
          <form onSubmit={onSubmit} noValidate className="space-y-7">
            <div className="grid gap-7 sm:grid-cols-2">
              <Field
                label="Name"
                id="contact-name"
                value={fields.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Your name"
              />
              <Field
                label="Email"
                id="contact-email"
                type="email"
                value={fields.email}
                onChange={set('email')}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>
            <Field
              label="Subject"
              id="contact-subject"
              value={fields.subject}
              onChange={set('subject')}
              error={errors.subject}
              placeholder="What's this about?"
            />
            <Field
              label="Message"
              id="contact-message"
              rows={5}
              value={fields.message}
              onChange={set('message')}
              error={errors.message}
              placeholder="Tell me about it…"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? 'Sending…' : 'Send message'}
              </button>

              {/* Send the same text through Gmail or WhatsApp instead. */}
              <a
                href={gmailComposeUrl({
                  subject: fields.subject,
                  body: composeMessage(fields, { includeSubject: false }),
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Mail className="w-4 h-4" />
                Gmail
              </a>
              <a
                href={whatsappUrl({ text: composeMessage(fields) })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Whatsapp className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </form>
        </SectionItem>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
          },
        }}
      />
    </SectionWrapper>
  )
}

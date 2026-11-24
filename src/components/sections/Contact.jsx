import { useState } from 'react'
import { Send, Loader2, Mail, ArrowUpRight, Copy, Check } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Github, Linkedin, Whatsapp } from '../ui/BrandIcons'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'
import { sendContactEmail } from '../../lib/emailjs'
import { composeMessage, gmailComposeUrl, handleFromUrl, whatsappUrl } from '../../lib/links'

const INITIAL = { name: '', email: '', subject: '', message: '' }

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
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email)
    setCopied(true)
    toast.success('Email copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

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
        title="Let's build together."
        subtitle="Open to Data Analyst & AI/ML opportunities — or just a conversation about data architectures, pipelines, and models."
      />

      <div className="grid gap-10 md:grid-cols-5 md:gap-12">
        {/* Info Channels Card */}
        <div className="md:col-span-2 space-y-6">
          <SectionItem>
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="mono-label text-[10px] text-emerald-600 dark:text-emerald-400">Direct Reach</span>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Get in touch</h3>
                <p className="text-xs text-neutral-500 dark:text-white/50 leading-relaxed">
                  Based in {personalInfo.location}. Open to remote and on-site collaborations.
                </p>
              </div>

              {/* One-click email copy button */}
              <button
                type="button"
                onClick={copyEmail}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all group text-left"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-neutral-400 dark:text-white/40 uppercase">Click to copy</div>
                  <div className="text-xs font-mono text-neutral-900 dark:text-white/90 truncate">{personalInfo.email}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] text-neutral-600 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0 ml-2">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
              </button>

              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {channels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 py-3 text-xs"
                  >
                    <span className="flex items-center gap-2.5 text-neutral-500 dark:text-white/50 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      <channel.icon className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
                      {channel.label}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-700 dark:text-white/70 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors truncate max-w-[150px]">
                      <span className="truncate">{channel.value}</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </SectionItem>
        </div>

        {/* Form Card */}
        <SectionItem className="md:col-span-3">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <form onSubmit={onSubmit} noValidate className="space-y-6">
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
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 px-6 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-md shadow-neutral-900/10"
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
                className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm text-neutral-700 dark:text-white/70 transition-colors hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white bg-black/[0.02] dark:bg-transparent"
              >
                <Mail className="w-4 h-4" />
                Gmail
              </a>
              <a
                href={whatsappUrl({ text: composeMessage(fields) })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm text-neutral-700 dark:text-white/70 transition-colors hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white bg-black/[0.02] dark:bg-transparent"
              >
                <Whatsapp className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </form>
          </div>
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

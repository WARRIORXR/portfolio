// Outbound contact links, derived from the shared profile data.
//
// Every link the site exposes (top bar, footer, contact section) is built here
// so an email/phone change in shared/profile.json propagates everywhere at
// once. Gmail compose and WhatsApp deep links are derived rather than stored,
// so there is no second copy of the address or number to keep in sync.

import { personalInfo } from '../data/personalInfo'

/** Digits only — wa.me and tel: links accept no spaces or punctuation. */
export function digitsOnly(value) {
  return String(value ?? '').replace(/[^\d]/g, '')
}

/** International WhatsApp number, e.g. `918872794962`. */
export const whatsappNumber = digitsOnly(personalInfo.phone)

/**
 * Gmail web compose, pre-addressed and optionally prefilled.
 * Falls back to the user's `mailto:` handler only if they are not signed in.
 */
export function gmailComposeUrl({ to = personalInfo.email, subject = '', body = '' } = {}) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to })
  if (subject) params.set('su', subject)
  if (body) params.set('body', body)
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** WhatsApp chat deep link, optionally with a prefilled message. */
export function whatsappUrl({ text = '', number = whatsappNumber } = {}) {
  const base = `https://wa.me/${number}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/** `tel:` link for click-to-call on mobile. */
export function telUrl(number = personalInfo.phone) {
  return `tel:+${digitsOnly(number)}`
}

/** The links shown in the top bar, footer and contact section. */
export const contactLinks = [
  { id: 'github', label: 'GitHub', href: personalInfo.github, external: true },
  { id: 'linkedin', label: 'LinkedIn', href: personalInfo.linkedin, external: true },
  { id: 'email', label: 'Gmail', href: gmailComposeUrl(), external: true },
  { id: 'whatsapp', label: 'WhatsApp', href: whatsappUrl(), external: true },
  { id: 'resume', label: 'Resume', href: personalInfo.resume, external: true },
]

/** Last path segment of a profile URL, e.g. the GitHub handle. */
export function handleFromUrl(url) {
  const parts = String(url ?? '')
    .split('/')
    .filter(Boolean)
  return parts.length ? parts[parts.length - 1] : ''
}

/** `github.com/WARRIORXR` style display text. */
export function hostAndPath(url, maxLength = 34) {
  const text = String(url ?? '').replace(/^https?:\/\//, '')
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

/**
 * Message body assembled from the contact form fields.
 *
 * `includeSubject` is on for WhatsApp (where the subject would otherwise be
 * lost) and off for Gmail, which already receives it as the subject header.
 */
export function composeMessage({ name, email, subject, message }, { includeSubject = true } = {}) {
  const lines = [message?.trim()].filter(Boolean)
  if (includeSubject && subject?.trim()) lines.unshift(`Subject: ${subject.trim()}`)
  const from = [name?.trim(), email?.trim()].filter(Boolean).join(' — ')
  if (from) lines.push('', `— ${from}`)
  return lines.join('\n')
}

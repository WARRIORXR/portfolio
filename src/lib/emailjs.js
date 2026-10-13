import emailjs from '@emailjs/browser'
import { apiPost } from './api'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export function initEmailJS() {
  if (PUBLIC_KEY && PUBLIC_KEY !== 'your_public_key') {
    emailjs.init(PUBLIC_KEY)
  }
}

/**
 * Send a contact message.
 *
 * Preferred path: `POST /api/contact` on the Rust gateway, which validates and
 * rate limits the submission before the Python service delivers it. Fallback:
 * EmailJS straight from the browser, then demo mode when no keys are set.
 */
export async function sendContactEmail({ name, email, subject, message }) {
  const viaApi = await apiPost('/contact', { name, email, subject, message })
  if (viaApi) {
    return {
      status: 202,
      text: `queued via ${viaApi.mode ?? 'api'}`,
      delivery: 'api',
      id: viaApi.id,
    }
  }

  if (!SERVICE_ID || SERVICE_ID === 'your_service_id') {
    // Demo mode — simulate success
    await new Promise((res) => setTimeout(res, 1500))
    return { status: 200, text: 'OK (demo mode)', delivery: 'demo' }
  }

  const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    from_name: name,
    from_email: email,
    subject,
    message,
    to_name: 'Tanish Jaswal',
    reply_to: email,
  })

  return { ...result, delivery: 'emailjs' }
}

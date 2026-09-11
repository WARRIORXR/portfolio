import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export function initEmailJS() {
  if (PUBLIC_KEY && PUBLIC_KEY !== 'your_public_key') {
    emailjs.init(PUBLIC_KEY)
  }
}

export async function sendContactEmail({ name, email, subject, message }) {
  if (!SERVICE_ID || SERVICE_ID === 'your_service_id') {
    // Demo mode — simulate success
    await new Promise((res) => setTimeout(res, 1500))
    return { status: 200, text: 'OK (demo mode)' }
  }

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    from_name: name,
    from_email: email,
    subject,
    message,
    to_name: 'Tanish Jaswal',
    reply_to: email,
  })
}

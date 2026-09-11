# 🚀 Tanish Jaswal — Portfolio

> **AI/ML & Computer Science Student** · Python Developer · Flask · Machine Learning

A complete glassmorphism portfolio built with **React + Vite + TailwindCSS + Framer Motion**, featuring GitHub integration, animated sections, and PWA support.

---

## ✨ Features

- **Glassmorphism UI** — backdrop-blur cards, gradient borders, glow effects
- **Particle Background** — interactive canvas particles with mouse repulsion
- **GitHub Integration** — auto-fetches repos from `WARRIORXR` with 1-hour cache
- **Typing Animation** — cycles through Python Developer → ML Engineer → AI Enthusiast
- **Scroll Animations** — Framer Motion scroll-triggered reveals
- **3D Card Tilt** — mouse-tracking perspective tilt on project/skill cards
- **Magnetic Buttons** — subtle magnetic spring effect on CTAs
- **Contact Form** — EmailJS integration with validation & toasts
- **PWA Ready** — installable progressive web app
- **Mobile Responsive** — works perfectly on all screen sizes
- **SEO Optimized** — Open Graph, Twitter cards, meta tags

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 5 |
| Styling | TailwindCSS 3 |
| Animation | Framer Motion 11 |
| Icons | React Icons |
| Email | EmailJS |
| Typing | react-type-animation |
| Counters | react-countup |
| Toasts | react-hot-toast |
| PWA | vite-plugin-pwa |

---

## 🚦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your EmailJS keys:
```bash
VITE_GITHUB_USERNAME=WARRIORXR
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── favicon.svg
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/
│   │   ├── ui/                 # GlassCard, GlassButton, GlassBadge
│   │   ├── layout/             # Navbar, Footer
│   │   ├── sections/           # Hero, About, Skills, Projects, Contact
│   │   └── shared/             # ParticleBackground, ScrollProgress, etc.
│   ├── data/
│   │   ├── personalInfo.js     # Resume data
│   │   └── skills.js           # Skills + featured projects
│   ├── hooks/
│   │   ├── useGithubRepos.js
│   │   └── use3DTilt.js
│   ├── lib/
│   │   ├── github.js           # API + cache
│   │   └── emailjs.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vercel.json                 # Vercel deployment
├── netlify.toml                # Netlify deployment
└── vite.config.js
```

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
Drag & drop the `dist/` folder to [app.netlify.com](https://app.netlify.com)

---

## 📧 EmailJS Setup

1. Create account at [emailjs.com](https://www.emailjs.com)
2. Add an **Email Service** (Gmail recommended)
3. Create a **Template** with variables: `from_name`, `from_email`, `subject`, `message`
4. Copy Service ID, Template ID, Public Key → paste in `.env`

> **Note:** Without EmailJS keys, the form runs in demo mode (simulates sending).

---

## 📄 License

MIT © 2025 Tanish Jaswal

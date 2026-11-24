// Flagship projects matching Tanish Jaswal's Data Analyst resume
export const featuredProjects = [
  {
    id: 'cinescope',
    title: 'CineScope',
    category: 'Analytics & AI Platform',
    headline: 'Movie Analytics & Recommendation Platform',
    description:
      'Aggregates ratings from IMDb, Rotten Tomatoes, and Metacritic into unified intelligence with cast, streaming availability, and trailers. Analyzes movie economics including budget, worldwide/domestic box office, net profit, and ROI %.',
    highlights: [
      '8 REST API endpoints with multi-attribute filtering by genre, era, rating, and language',
      'AI summaries and personalized recommendation engine powered by Gemini API',
      'API caching layer and graceful fallbacks for high uptime and resilient data delivery',
    ],
    tech: ['Python', 'Flask', 'REST APIs', 'Gemini API', 'Pandas'],
    badge: 'ROI Analytics & AI',
    github: 'https://github.com/WARRIORXR',
    demo: 'https://github.com/WARRIORXR',
    year: '2026',
    featured: true,
  },
  {
    id: 'expenseflow',
    title: 'ExpenseFlow',
    category: 'FinTech & BI Dashboard',
    headline: 'Financial Analytics & Trends Dashboard',
    description:
      'High-performance personal finance dashboard calculating income, expenses, net balance, and savings rates with 3 interactive Chart.js visualizations (doughnut, bar, line) for daily, monthly, and category trends.',
    highlights: [
      'Proactive budget thresholds with instant visual alerts at 80% and 100% capacity',
      'Multi-currency engine with live conversion across 7 international currencies',
      'Full data export engine outputting cleanly formatted PDF, CSV, and JSON files',
    ],
    tech: ['JavaScript', 'Chart.js', 'Vite', 'Tailwind CSS'],
    badge: 'Multi-Currency BI',
    github: 'https://github.com/WARRIORXR',
    demo: 'https://github.com/WARRIORXR',
    year: '2026',
    featured: true,
  },
  {
    id: 'daily-ink',
    title: 'Daily Ink',
    category: 'Full-Stack PWA',
    headline: 'Memory Journal & Spaced Repetition System',
    description:
      'Full-stack progressive web app implementing SuperMemo-2 (SM-2) spaced repetition review cycles, streak tracking, mood analytics, and real-time cross-device synchronization with a robust PostgreSQL backend.',
    highlights: [
      'PostgreSQL schema with Row-Level Security (RLS) and PBKDF2 credential hashing',
      'Instant full-text journal search with calendar, task, date, and sentiment filters',
      'Installable offline-first PWA with background sync and zero-latency local caching',
    ],
    tech: ['React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL'],
    badge: 'SM-2 Spaced Repetition',
    github: 'https://github.com/WARRIORXR',
    demo: 'https://github.com/WARRIORXR',
    year: '2026',
    featured: true,
  },
  {
    id: 'school-aqi-alert',
    title: 'School AQI Alert',
    category: 'Serverless IoT & Cloud',
    headline: 'Real-Time Air Quality Warning Pipeline',
    description:
      'Environmental Hacks IRL hackathon winner: ingests atmospheric feeds and 7 AM–4 PM AQI forecasts from Open-Meteo to dispatch automated alerts to school principals at 6:30 AM for hazardous air safety decisions.',
    highlights: [
      'Serverless event-driven architecture using AWS Lambda, DynamoDB, SNS, and EventBridge',
      'Automatic 7:30 AM escalation to regional district officers for unconfirmed warnings',
      'Bilingual alert delivery (English & Hindi) validated with 19 automated test suites',
    ],
    tech: ['Python', 'AWS Lambda', 'DynamoDB', 'AWS SNS', 'EventBridge'],
    badge: 'AWS Serverless',
    github: 'https://github.com/WARRIORXR',
    demo: 'https://github.com/WARRIORXR',
    year: '2026',
    featured: true,
  },
]

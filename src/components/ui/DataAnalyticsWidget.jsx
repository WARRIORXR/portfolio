import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Cpu, PieChart, Wind, Code2, ArrowUpDown, Copy, Check } from 'lucide-react'

const DATASETS = {
  movies: {
    id: 'movies',
    title: 'Box Office ROI Analysis (CineScope)',
    badge: 'API & Financial Analytics',
    description: 'Aggregated financial returns across 1,200+ films analyzed via Flask REST endpoints.',
    accentDot: 'bg-emerald-500',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    headerGradient: 'from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-500/10 dark:to-transparent',
    unitPrefix: '+',
    unitSuffix: '%',
    stats: [
      { label: 'Top ROI Genre', value: 'Sci-Fi (+340%)' },
      { label: 'Mean Box Office', value: '$184.2M' },
      { label: 'Sample Size', value: '1,200 Titles' },
    ],
    items: [
      { name: 'Sci-Fi & Fantasy', value: 340, benchmark: '$210M Avg Revenue', color: '#059669' },
      { name: 'Animation & Family', value: 280, benchmark: '$195M Avg Revenue', color: '#0d9488' },
      { name: 'Action & Adventure', value: 220, benchmark: '$160M Avg Revenue', color: '#2563eb' },
      { name: 'Mystery & Thriller', value: 190, benchmark: '$85M Avg Revenue', color: '#7c3aed' },
      { name: 'Drama & Biography', value: 145, benchmark: '$62M Avg Revenue', color: '#d97706' },
    ],
    codeLang: 'Python · Pandas',
    code: `# CineScope ROI aggregation endpoint (/api/analytics/genre-roi)
roi_summary = (
  df.assign(roi_pct=lambda x: ((x.revenue - x.budget) / x.budget) * 100)
    .groupby("primary_genre", as_index=False)
    .agg(mean_roi=("roi_pct", "mean"), avg_rev=("revenue", "mean"))
    .sort_values("mean_roi", ascending=False)
)`,
  },
  expenses: {
    id: 'expenses',
    title: 'Monthly Cash Flow & Allocation (ExpenseFlow)',
    badge: 'FinTech Dashboard',
    description: 'Income distribution, savings targets, and multi-currency budgeting metrics.',
    accentDot: 'bg-blue-500',
    accentText: 'text-blue-700 dark:text-blue-400',
    headerGradient: 'from-blue-50/80 via-sky-50/40 to-transparent dark:from-blue-500/10 dark:to-transparent',
    unitPrefix: '',
    unitSuffix: '%',
    stats: [
      { label: 'Target Savings', value: '38.5%' },
      { label: 'Budget Health', value: '78.2% (Safe)' },
      { label: 'FX Currencies', value: '7 Live Rates' },
    ],
    items: [
      { name: 'Investments & Savings', value: 38, benchmark: 'Target 35%', color: '#2563eb' },
      { name: 'Housing & Utilities', value: 28, benchmark: 'Fixed Cap', color: '#0284c7' },
      { name: 'Tech, Cloud & Tools', value: 16, benchmark: 'Operational', color: '#059669' },
      { name: 'Living & Dining', value: 12, benchmark: 'Variable', color: '#d97706' },
      { name: 'Emergency Reserve', value: 6, benchmark: 'Liquid Buffer', color: '#7c3aed' },
    ],
    codeLang: 'SQL · PostgreSQL',
    code: `-- ExpenseFlow category share & 80% budget threshold alert
SELECT category,
       ROUND(SUM(amount_usd) * 100.0 / SUM(SUM(amount_usd)) OVER (), 1) AS share_pct,
       CASE WHEN SUM(amount_usd) >= monthly_cap * 0.8 THEN 'ALERT' ELSE 'OK' END AS status
FROM ledger_entries
WHERE posted_at >= date_trunc('month', CURRENT_DATE)
GROUP BY category, monthly_cap;`,
  },
  models: {
    id: 'models',
    title: 'Classifier Validation Benchmarks (Netmax & ML)',
    badge: 'Scikit-learn Evaluation',
    description: 'Comparative test accuracy, F1-scores, and 5-fold cross-validation across algorithms.',
    accentDot: 'bg-violet-500',
    accentText: 'text-violet-700 dark:text-violet-400',
    headerGradient: 'from-violet-50/80 via-indigo-50/40 to-transparent dark:from-violet-500/10 dark:to-transparent',
    unitPrefix: '',
    unitSuffix: '%',
    stats: [
      { label: 'Best Estimator', value: 'Random Forest (94.2%)' },
      { label: 'Validation', value: '5-Fold CV' },
      { label: 'Inference SLA', value: '< 12ms' },
    ],
    items: [
      { name: 'Random Forest Classifier', value: 94.2, benchmark: 'F1: 0.94 · 100 Trees', color: '#7c3aed' },
      { name: 'Gradient Boosting', value: 91.8, benchmark: 'F1: 0.91 · LR 0.05', color: '#4f46e5' },
      { name: 'Support Vector Machine (RBF)', value: 88.5, benchmark: 'F1: 0.88 · C=1.0', color: '#2563eb' },
      { name: 'K-Nearest Neighbors (K=5)', value: 85.0, benchmark: 'F1: 0.85 · Euclidean', color: '#0d9488' },
      { name: 'Logistic Regression Baseline', value: 81.4, benchmark: 'F1: 0.81 · L2 Norm', color: '#059669' },
    ],
    codeLang: 'Python · Scikit-learn',
    code: `# Stratified 5-Fold Cross-Validation pipeline
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
pipe = make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=100))
scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="accuracy")
print(f"CV Accuracy: {scores.mean():.3%}")  # 94.2%`,
  },
  aqi: {
    id: 'aqi',
    title: 'School Window AQI Telemetry (School AQI Alert)',
    badge: 'AWS Serverless IoT',
    description: 'Open-Meteo atmospheric PM2.5 / AQI curve evaluated at 06:30 AM IST for school safety alerts.',
    accentDot: 'bg-amber-500',
    accentText: 'text-amber-700 dark:text-amber-400',
    headerGradient: 'from-amber-50/80 via-emerald-50/40 to-transparent dark:from-amber-500/10 dark:to-transparent',
    unitPrefix: '',
    unitSuffix: ' AQI',
    stats: [
      { label: 'Dispatch Trigger', value: '06:30 AM IST' },
      { label: 'Escalation SLA', value: '07:30 AM District' },
      { label: 'Verified Suites', value: '19 Passing' },
    ],
    items: [
      { name: '07:00 AM · Morning Assembly', value: 218, benchmark: 'Alert Sent · Unhealthy', color: '#d97706' },
      { name: '09:00 AM · First Recess', value: 192, benchmark: 'Indoor Protocol Active', color: '#ea580c' },
      { name: '11:00 AM · Midday Class', value: 164, benchmark: 'Moderate-Poor Trend', color: '#0d9488' },
      { name: '01:00 PM · Lunch Window', value: 138, benchmark: 'Dispersing · Vent Safe', color: '#2563eb' },
      { name: '03:00 PM · Dismissal', value: 122, benchmark: 'Cleared Below Cap', color: '#059669' },
    ],
    codeLang: 'Python · AWS Lambda',
    code: `# EventBridge 06:30 AM IST cron -> Principal Alert Dispatcher
forecast = fetch_open_meteo_window(lat, lon, hours=(7, 16))
peak_aqi = max(slot.aqi for slot in forecast)
if peak_aqi >= SCHOOL_THRESHOLD_AQI:
    sns.publish(TopicArn=SCHOOL_TOPIC, Message=format_bilingual_alert(peak_aqi))
    dynamodb.put_item(Item={"school_id": sid, "ack_deadline": "07:30"})`,
  },
}

const TABS = [
  { id: 'movies', label: 'ROI Study', icon: BarChart3 },
  { id: 'expenses', label: 'Budget', icon: PieChart },
  { id: 'models', label: 'ML Scores', icon: Cpu },
  { id: 'aqi', label: 'AQI Alert', icon: Wind },
]

export function DataAnalyticsWidget() {
  const [selected, setSelected] = useState('movies')
  const [activeItem, setActiveItem] = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const current = DATASETS[selected]
  const maxVal = Math.max(...current.items.map((i) => i.value))

  const orderedItems = useMemo(() => {
    const copy = [...current.items]
    return sortAsc ? copy.sort((a, b) => a.value - b.value) : copy.sort((a, b) => b.value - a.value)
  }, [current.items, sortAsc])

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopiedCode(true)
      window.setTimeout(() => setCopiedCode(false), 1800)
    } catch {
      // ignore clipboard restriction
    }
  }

  return (
    <div id="data-lab" className="paper-surface rounded-2xl overflow-hidden scroll-mt-24">
      {/* Header Bar with Live Color Tint */}
      <div className={`p-5 sm:p-7 border-b border-black/[0.07] dark:border-white/[0.08] bg-gradient-to-r ${current.headerGradient} flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors duration-300`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${current.accentDot}`} />
            <span className={`mono-label text-[10px] font-semibold ${current.accentText}`}>
              Live Data Telemetry &middot; {current.badge}
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-[#0e1422] dark:text-white">
            {current.title}
          </h3>
          <p className="text-xs text-[#586375] dark:text-neutral-400">
            {current.description}
          </p>
        </div>

        {/* Controls: Dataset Tabs + Sort + Code Inspector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#efede7]/90 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isSelected = selected === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelected(tab.id)
                    setActiveItem(null)
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'text-[#0e1422] dark:text-white'
                      : 'text-[#586375] dark:text-neutral-400 hover:text-[#0e1422] dark:hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="telemetry-dataset-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 rounded-lg bg-white dark:bg-[#23242b] border border-black/[0.07] dark:border-white/[0.09] shadow-sm"
                    />
                  )}
                  <Icon className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-colors ${
              showCode
                ? 'bg-[#0e1422] text-white border-[#0e1422] dark:bg-emerald-400 dark:text-[#09090b] dark:border-emerald-400'
                : 'bg-white dark:bg-[#141418] text-[#0e1422] dark:text-neutral-200 border-black/[0.09] dark:border-white/[0.12] hover:border-emerald-600/40'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCode ? 'Chart' : 'Query'}</span>
          </button>
        </div>
      </div>

      {/* Hairline KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black/[0.07] dark:bg-white/[0.08] border-b border-black/[0.07] dark:border-white/[0.08]">
        {current.stats.map((stat, idx) => (
          <div key={stat.label} className="bg-[#faf9f6] dark:bg-[#141418] px-5 py-3.5 flex items-center justify-between sm:block space-y-0.5">
            <div className="text-[10px] font-mono text-[#586375] dark:text-neutral-400 uppercase tracking-wider">
              {stat.label}
            </div>
            <div className={`text-sm font-semibold tabular-nums ${idx === 0 ? current.accentText : 'text-[#0e1422] dark:text-white'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Body: Interactive Chart OR Query Snippet */}
      <div className="p-5 sm:p-7 space-y-2">
        <AnimatePresence mode="wait">
          {showCode ? (
            <motion.div
              key={`${selected}-code`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-black/[0.08] dark:border-white/[0.09] bg-[#faf9f6] dark:bg-[#0c0d11] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.07] dark:border-white/[0.08] bg-[#efede7]/65 dark:bg-white/[0.03]">
                <span className="font-mono text-[11px] font-medium text-[#586375] dark:text-neutral-400">
                  {current.codeLang}
                </span>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#0e1422] dark:text-neutral-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy snippet'}</span>
                </button>
              </div>
              <pre className="p-4 sm:p-5 overflow-x-auto text-xs font-mono leading-relaxed text-[#0e1422] dark:text-emerald-100">
                <code>{current.code}</code>
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key={`${selected}-${sortAsc ? 'asc' : 'desc'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {orderedItems.map((item, idx) => {
                const pct = (item.value / maxVal) * 100
                const isHovered = activeItem === idx

                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setActiveItem(idx)}
                    onMouseLeave={() => setActiveItem(null)}
                    className={`p-3 rounded-xl transition-colors cursor-default ${
                      isHovered
                        ? 'bg-[#efede7]/75 dark:bg-white/[0.05]'
                        : 'hover:bg-[#faf9f6] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2 gap-2">
                      <span className="flex items-center gap-2 font-medium text-[#0e1422] dark:text-neutral-100">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-[#586375] dark:text-neutral-400 font-mono hidden xs:inline sm:inline">
                          {item.benchmark}
                        </span>
                        <span className="font-mono font-semibold text-[#0e1422] dark:text-white tabular-nums min-w-[4rem] text-right">
                          {current.unitPrefix}
                          {item.value}
                          {current.unitSuffix}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-[#efede7] dark:bg-white/[0.07] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.42, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-3 mt-2 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between text-[11px] text-[#586375] dark:text-neutral-400 font-mono">
          <span>Interactive EDA telemetry</span>
          {!showCode ? (
            <button
              type="button"
              onClick={() => setSortAsc((s) => !s)}
              className="inline-flex items-center gap-1 text-[#0e1422] dark:text-neutral-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort: {sortAsc ? 'Ascending ↑' : 'Descending ↓'}</span>
            </button>
          ) : (
            <span>Backend pipeline logic</span>
          )}
        </div>
      </div>
    </div>
  )
}

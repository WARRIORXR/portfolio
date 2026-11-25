import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Cpu, PieChart } from 'lucide-react'

const DATASETS = {
  movies: {
    id: 'movies',
    title: 'Box Office ROI Analysis (CineScope)',
    badge: 'API & Financial Analytics',
    description: 'Aggregated financial returns across 1,200+ films analyzed via Flask REST endpoints.',
    accentDot: 'bg-emerald-500',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    headerGradient: 'from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-500/10 dark:to-transparent',
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
  },
  expenses: {
    id: 'expenses',
    title: 'Monthly Cash Flow & Allocation (ExpenseFlow)',
    badge: 'FinTech Dashboard',
    description: 'Income distribution, savings targets, and multi-currency budgeting metrics.',
    accentDot: 'bg-blue-500',
    accentText: 'text-blue-700 dark:text-blue-400',
    headerGradient: 'from-blue-50/80 via-sky-50/40 to-transparent dark:from-blue-500/10 dark:to-transparent',
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
  },
  models: {
    id: 'models',
    title: 'Classifier Validation Benchmarks (Netmax & ML)',
    badge: 'Scikit-learn Evaluation',
    description: 'Comparative test accuracy, F1-scores, and 5-fold cross-validation across algorithms.',
    accentDot: 'bg-violet-500',
    accentText: 'text-violet-700 dark:text-violet-400',
    headerGradient: 'from-violet-50/80 via-indigo-50/40 to-transparent dark:from-violet-500/10 dark:to-transparent',
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
  },
}

const TABS = [
  { id: 'movies', label: 'ROI Study', icon: BarChart3, dot: 'bg-emerald-500' },
  { id: 'expenses', label: 'Budget', icon: PieChart, dot: 'bg-blue-500' },
  { id: 'models', label: 'ML Scores', icon: Cpu, dot: 'bg-violet-500' },
]

export function DataAnalyticsWidget() {
  const [selected, setSelected] = useState('movies')
  const [activeItem, setActiveItem] = useState(null)
  const current = DATASETS[selected]
  const maxVal = Math.max(...current.items.map((i) => i.value))

  return (
    <div className="paper-surface rounded-2xl overflow-hidden">
      {/* Header Bar with Live Color Tint */}
      <div className={`p-5 sm:p-7 border-b border-black/[0.07] dark:border-white/[0.08] bg-gradient-to-r ${current.headerGradient} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300`}>
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

        {/* Segmented Dataset Switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#efede7]/90 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] self-start sm:self-auto">
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

      {/* Interactive Bar Readout */}
      <div className="p-5 sm:p-7 space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {current.items.map((item, idx) => {
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
                      <span className="font-mono font-semibold text-[#0e1422] dark:text-white tabular-nums min-w-[3.5rem] text-right">
                        {selected === 'movies' ? `+${item.value}%` : `${item.value}%`}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-[#efede7] dark:bg-white/[0.07] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.45, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        <div className="pt-3 mt-2 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between text-[11px] text-[#586375] dark:text-neutral-400 font-mono">
          <span>Interactive EDA telemetry</span>
          <span>Hover rows to inspect breakdown</span>
        </div>
      </div>
    </div>
  )
}

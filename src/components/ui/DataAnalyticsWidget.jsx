import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Cpu, PieChart } from 'lucide-react'

const DATASETS = {
  movies: {
    id: 'movies',
    title: 'Box Office ROI Analysis (CineScope)',
    badge: 'API & Financial Analytics',
    description: 'Aggregated financial returns across 1,200+ films analyzed via Flask REST endpoints.',
    stats: [
      { label: 'Highest ROI Category', value: 'Sci-Fi (+340%)' },
      { label: 'Average Box Office', value: '$184.2M' },
      { label: 'Dataset Size', value: '1,200 Titles' },
    ],
    items: [
      { name: 'Sci-Fi & Fantasy', value: 340, benchmark: '$210M Avg Revenue', color: '#06b6d4' },
      { name: 'Animation & Family', value: 280, benchmark: '$195M Avg Revenue', color: '#3b82f6' },
      { name: 'Action & Adventure', value: 220, benchmark: '$160M Avg Revenue', color: '#8b5cf6' },
      { name: 'Mystery & Thriller', value: 190, benchmark: '$85M Avg Revenue', color: '#10b981' },
      { name: 'Drama & Biography', value: 145, benchmark: '$62M Avg Revenue', color: '#f59e0b' },
    ],
  },
  expenses: {
    id: 'expenses',
    title: 'Monthly Cash Flow & Trends (ExpenseFlow)',
    badge: 'FinTech Dashboard',
    description: 'Income distribution, savings rates, and multi-currency budgeting metrics.',
    stats: [
      { label: 'Target Savings Rate', value: '38.5%' },
      { label: 'Budget Utilization', value: '78.2% (Safe)' },
      { label: 'Supported Currencies', value: '7 International' },
    ],
    items: [
      { name: 'Investments & Savings', value: 38, benchmark: 'Target 35%', color: '#10b981' },
      { name: 'Housing & Utilities', value: 28, benchmark: 'Fixed Cap', color: '#3b82f6' },
      { name: 'Tech, Cloud & Tools', value: 16, benchmark: 'Operational', color: '#06b6d4' },
      { name: 'Living & Dining', value: 12, benchmark: 'Variable', color: '#f59e0b' },
      { name: 'Emergency Reserve', value: 6, benchmark: 'Liquid', color: '#8b5cf6' },
    ],
  },
  models: {
    id: 'models',
    title: 'Model Evaluation Benchmarks (Netmax & ML)',
    badge: 'Scikit-learn & AI Evaluation',
    description: 'Comparative classification test accuracy, F1-scores, and cross-validation across algorithms.',
    stats: [
      { label: 'Top Performer', value: 'Random Forest (94.2%)' },
      { label: 'Cross-Validation Folds', value: '5-Fold CV' },
      { label: 'Inference Latency', value: '< 12ms' },
    ],
    items: [
      { name: 'Random Forest Classifier', value: 94.2, benchmark: 'F1: 0.94 • 100 Trees', color: '#10b981' },
      { name: 'Gradient Boosting Machine', value: 91.8, benchmark: 'F1: 0.91 • LR 0.05', color: '#06b6d4' },
      { name: 'Support Vector Machine (RBF)', value: 88.5, benchmark: 'F1: 0.88 • C=1.0', color: '#3b82f6' },
      { name: 'K-Nearest Neighbors (K=5)', value: 85.0, benchmark: 'F1: 0.85 • Euclidean', color: '#8b5cf6' },
      { name: 'Logistic Regression Baseline', value: 81.4, benchmark: 'F1: 0.81 • L2 Penalty', color: '#f59e0b' },
    ],
  },
}

export function DataAnalyticsWidget() {
  const [selected, setSelected] = useState('movies')
  const [activeItem, setActiveItem] = useState(null)
  const current = DATASETS[selected]

  const maxVal = Math.max(...current.items.map((i) => i.value))

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="mono-label text-[10px] text-emerald-600 dark:text-emerald-400">
              Interactive Data Sandbox
            </span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {current.title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-white/50">
            {current.description}
          </p>
        </div>

        {/* Dataset Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] self-start sm:self-auto shadow-xs">
          <button
            onClick={() => {
              setSelected('movies')
              setActiveItem(null)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selected === 'movies'
                ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ROI</span>
          </button>
          <button
            onClick={() => {
              setSelected('expenses')
              setActiveItem(null)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selected === 'expenses'
                ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Budget</span>
          </button>
          <button
            onClick={() => {
              setSelected('models')
              setActiveItem(null)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selected === 'models'
                ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Models</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-3 gap-3">
        {current.stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] space-y-0.5"
          >
            <div className="text-[10px] font-mono text-neutral-500 dark:text-white/40 uppercase">
              {stat.label}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="space-y-3 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {current.items.map((item, idx) => {
              const pct = (item.value / maxVal) * 100
              const isHovered = activeItem === idx

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveItem(idx)}
                  onMouseLeave={() => setActiveItem(null)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-white/[0.06]'
                      : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-neutral-800 dark:text-white/90">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500 dark:text-white/40 font-mono">
                        {item.benchmark}
                      </span>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                        {selected === 'expenses'
                          ? `${item.value}%`
                          : selected === 'movies'
                          ? `+${item.value}%`
                          : `${item.value}%`}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 dark:text-white/40 font-mono">
        <span>Hover bars for live breakdown</span>
        <span>Source: Project EDA &amp; Validations</span>
      </div>
    </div>
  )
}

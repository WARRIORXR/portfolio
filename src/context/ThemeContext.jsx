import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
})

function applyTheme(next) {
  const root = document.documentElement
  if (next === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
    root.style.backgroundColor = '#09090b'
    root.style.color = '#f4f4f5'
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.backgroundColor = '#faf9f6'
    root.style.color = '#0e1422'
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', next === 'dark' ? '#09090b' : '#faf9f6')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme')
      return saved === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem('portfolio-theme', theme)
    } catch {
      // ignore storage failures
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}

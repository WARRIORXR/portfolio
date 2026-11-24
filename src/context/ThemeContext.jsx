import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.backgroundColor = '#fafafa'
    root.style.color = '#0f172a'
    try {
      localStorage.setItem('portfolio-theme', 'light')
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      const root = document.documentElement
      if (next === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
        root.style.backgroundColor = '#000000'
        root.style.color = '#ffffff'
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
        root.style.backgroundColor = '#fafafa'
        root.style.color = '#0f172a'
      }
      try {
        localStorage.setItem('portfolio-theme', next)
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

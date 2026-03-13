import { useState, useEffect, createContext, useContext } from 'react'

export const ThemeContext = createContext({ dark: true, toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function useThemeProvider() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('mr-mouse-theme')
    if (saved !== null) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('mr-mouse-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark(d => !d) }
}

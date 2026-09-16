import { useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="fixed bottom-4 left-4 z-50 grid size-11 place-items-center rounded-full border border-brand-950/15 bg-white text-brand-950 transition hover:bg-brand-50 dark:border-white/15 dark:bg-night-soft dark:text-brand-100 dark:hover:bg-white/10"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}

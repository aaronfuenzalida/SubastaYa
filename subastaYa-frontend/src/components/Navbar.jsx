import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Catálogo' },
  { to: '/auctions/new', label: 'Publicar' },
  { to: '/wallet', label: 'Billetera' },
  { to: '/activity', label: 'Mis actividades' },
]

function linkClasses({ isActive }) {
  return [
    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-brand-950/70 hover:bg-brand-50 hover:text-brand-700 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white',
  ].join(' ')
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-night/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white shadow-md shadow-brand-600/30">
            S
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-brand-950 dark:text-white">
            Subasta<span className="text-brand-600 dark:text-brand-400">Ya</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClasses}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-brand-950/70 dark:text-white/60">
                Hola,{' '}
                <span className="font-semibold text-brand-950 dark:text-white">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-brand-200 px-4 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:border-white/20 dark:text-brand-100 dark:hover:bg-white/10"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Ingresar
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="grid size-10 place-items-center rounded-lg text-brand-950 hover:bg-brand-50 md:hidden dark:text-white dark:hover:bg-white/10"
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-brand-100 bg-white px-4 py-3 md:hidden dark:border-white/10 dark:bg-night">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={linkClasses}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="mt-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 dark:border-white/20 dark:text-brand-100"
            >
              Salir ({user.name})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white dark:bg-brand-500"
            >
              Ingresar
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}

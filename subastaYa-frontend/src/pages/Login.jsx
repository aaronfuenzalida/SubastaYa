import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { Field, PrimaryButton } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const auth = await loginRequest(form.email, form.password)
      login(auth)
      toast.success(`¡Hola de nuevo, ${auth.name}!`)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:gap-16">
        <div>
          <h1 className="font-display text-[22px] font-bold text-brand-950 dark:text-white">
            Ingresá a Subasta<span className="text-brand-600 dark:text-brand-400">Ya</span>
          </h1>
          <p className="mt-1 text-sm text-brand-950/55 dark:text-white/55">
            Tus ofertas quedan respaldadas por tu saldo en garantía.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <Field
              label="Email"
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
            />
            <Field
              label="Contraseña"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            <PrimaryButton type="submit" loading={loading} className="mt-2">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </PrimaryButton>
          </form>

          <p className="mt-5 text-sm text-brand-950/55 dark:text-white/55">
            ¿No tenés cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Creala gratis
            </Link>
          </p>
        </div>

        {/* Viñeta de producto: una subasta en vivo, no un banner */}
        <aside className="hidden md:block">
          <div className="rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
            <div className="flex items-center justify-between border-b border-brand-950/10 px-4 py-2.5 dark:border-white/10">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand-600 dark:bg-brand-400" />
                </span>
                Subasta activa
              </span>
              <span className="text-[11px] font-medium tabular-nums text-brand-950/50 dark:text-white/50">
                Finaliza en 02:34
              </span>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-sm font-semibold text-brand-950 dark:text-white">MacBook Pro 14”</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[13px] text-brand-950/55 dark:text-white/55">Última oferta</span>
                <span className="font-display text-lg font-bold tabular-nums text-brand-600 dark:text-brand-400">
                  $850.000
                </span>
              </div>
            </div>
            <ul className="border-t border-brand-950/10 px-4 py-2 text-[13px] dark:border-white/10">
              <li className="flex items-baseline justify-between py-1">
                <span className="w-12 text-brand-950/60 dark:text-white/60">C***</span>
                <span className="font-medium tabular-nums dark:text-white/90">$850.000</span>
                <span className="w-16 text-right text-brand-950/40 dark:text-white/40">hace 12 s</span>
              </li>
              <li className="flex items-baseline justify-between py-1">
                <span className="w-12 text-brand-950/60 dark:text-white/60">M***</span>
                <span className="font-medium tabular-nums dark:text-white/90">$820.000</span>
                <span className="w-16 text-right text-brand-950/40 dark:text-white/40">hace 1 min</span>
              </li>
              <li className="flex items-baseline justify-between py-1">
                <span className="w-12 text-brand-950/60 dark:text-white/60">J***</span>
                <span className="font-medium tabular-nums dark:text-white/90">$795.000</span>
                <span className="w-16 text-right text-brand-950/40 dark:text-white/40">hace 3 min</span>
              </li>
            </ul>
          </div>
          <p className="mt-2.5 text-[12px] text-brand-950/45 dark:text-white/40">
            Las ofertas se muestran con seudónimo, igual que en la sala en vivo.
          </p>
        </aside>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register as registerRequest } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { Field, PrimaryButton } from '../components/ui'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const auth = await registerRequest(form.name, form.email, form.password)
      // El registro ya devuelve el token: sesion iniciada
      login(auth)
      toast.success(`¡Bienvenido, ${auth.name}! Tu billetera ya está lista.`)
      navigate('/', { replace: true })
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
            Creá tu cuenta en Subasta<span className="text-brand-600 dark:text-brand-400">Ya</span>
          </h1>
          <p className="mt-1 text-sm text-brand-950/55 dark:text-white/55">
            Tu billetera se crea automáticamente con la cuenta.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <Field
              label="Nombre"
              type="text"
              name="name"
              required
              maxLength={100}
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
            />
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
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
            />
            <PrimaryButton type="submit" loading={loading} className="mt-2">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </PrimaryButton>
          </form>

          <p className="mt-5 text-sm text-brand-950/55 dark:text-white/55">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Ingresá
            </Link>
          </p>
        </div>

        {/* Viñeta de producto: la billetera con escrow, el diferencial de la plataforma */}
        <aside className="hidden md:block">
          <div className="rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
            <div className="border-b border-brand-950/10 px-4 py-2.5 dark:border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
                Tu billetera
              </span>
            </div>
            <dl className="px-4 py-3 text-[13px] text-brand-950/70 dark:text-white/60">
              <div className="flex items-baseline justify-between py-1.5">
                <dt>Saldo total</dt>
                <dd className="font-medium tabular-nums text-brand-950 dark:text-white/90">$150.000</dd>
              </div>
              <div className="flex items-baseline justify-between py-1.5">
                <dt>En garantía</dt>
                <dd className="font-medium tabular-nums text-brand-600 dark:text-brand-400">$45.000</dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between border-t border-brand-950/10 pt-2.5 dark:border-white/10">
                <dt className="font-semibold text-brand-950 dark:text-white">Disponible</dt>
                <dd className="font-display text-base font-bold tabular-nums text-brand-950 dark:text-white">
                  $105.000
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-2.5 text-[12px] text-brand-950/45 dark:text-white/40">
            Cuando liderás una subasta, tu oferta queda en garantía y se libera
            automáticamente si te superan.
          </p>
        </aside>
      </div>
    </section>
  )
}

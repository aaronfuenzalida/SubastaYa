import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createAuction, getCategories } from '../api/auctions'
import { Field, PrimaryButton, Select, TextArea } from '../components/ui'
import { formatMoney } from '../lib/format'

// datetime-local trabaja en hora local sin zona; este helper formatea una Date a ese formato
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function CreateAuction() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(() => ({
    title: '',
    description: '',
    imageUrl: '',
    categoryId: '',
    basePrice: '',
    minIncrement: '',
    startsAt: toLocalInputValue(new Date(Date.now() + 5 * 60_000)),
    endsAt: toLocalInputValue(new Date(Date.now() + 24 * 60 * 60_000)),
  }))

  useEffect(() => {
    getCategories().then(setCategories).catch(() => toast.error('No se pudieron cargar las categorías'))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones cruzadas en pantalla (Modulo 2): el back las repite como red final
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      toast.error('La fecha de cierre debe ser posterior a la de inicio')
      return
    }
    if (new Date(form.endsAt) <= new Date()) {
      toast.error('La fecha de cierre debe estar en el futuro')
      return
    }

    setLoading(true)
    try {
      const auction = await createAuction({
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        categoryId: Number(form.categoryId),
        basePrice: Number(form.basePrice),
        minIncrement: Number(form.minIncrement),
        // toISOString convierte la hora local del input a UTC, que es lo que espera la API
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      })
      toast.success('¡Subasta publicada!')
      navigate(`/auctions/${auction.id}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const categoryName =
    categories.find((c) => c.id === Number(form.categoryId))?.name ?? 'Categoría'

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-white">
        Publicar subasta
      </h1>
      <p className="mt-1 text-sm text-brand-950/55 dark:text-white/55">
        Completá los datos del producto y la ventana de tiempo. La publicación es inmediata.
      </p>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Título"
            type="text"
            name="title"
            required
            maxLength={150}
            placeholder="Ej: iPhone 15 Pro 256GB"
            value={form.title}
            onChange={handleChange}
          />
          <TextArea
            label="Descripción"
            name="description"
            required
            maxLength={2000}
            rows={4}
            placeholder="Estado, detalles, qué incluye…"
            value={form.description}
            onChange={handleChange}
          />
          <Field
            label="URL de la imagen"
            type="url"
            name="imageUrl"
            required
            maxLength={500}
            placeholder="https://…"
            value={form.imageUrl}
            onChange={handleChange}
          />
          <Select label="Categoría" name="categoryId" required value={form.categoryId} onChange={handleChange}>
            <option value="" disabled>
              Elegí una categoría
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Precio base ($)"
              type="number"
              name="basePrice"
              required
              min={1}
              placeholder="30000"
              value={form.basePrice}
              onChange={handleChange}
            />
            <Field
              label="Incremento mínimo ($)"
              type="number"
              name="minIncrement"
              required
              min={1}
              placeholder="5000"
              value={form.minIncrement}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Inicio"
              type="datetime-local"
              name="startsAt"
              required
              value={form.startsAt}
              onChange={handleChange}
            />
            <Field
              label="Cierre"
              type="datetime-local"
              name="endsAt"
              required
              value={form.endsAt}
              onChange={handleChange}
            />
          </div>

          <PrimaryButton type="submit" loading={loading} className="mt-2">
            {loading ? 'Publicando…' : 'Publicar subasta'}
          </PrimaryButton>
        </form>

        {/* Vista previa en vivo: como se vera la card en el catalogo */}
        <aside className="hidden lg:block">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
            Vista previa
          </p>
          <div className="overflow-hidden rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-100 dark:bg-white/5">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="grid size-full place-items-center text-sm text-brand-950/40 dark:text-white/30">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {categoryName}
              </p>
              <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-semibold text-brand-950 dark:text-white">
                {form.title || 'Título de tu producto'}
              </h3>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-brand-950/50 dark:text-white/50">Precio base</span>
                <span className="font-display text-base font-bold tabular-nums text-brand-950 dark:text-white">
                  {formatMoney(Number(form.basePrice) || 0)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

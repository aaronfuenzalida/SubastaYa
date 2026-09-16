import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAuctions, getCategories } from '../api/auctions'
import AuctionCard from '../components/AuctionCard'
import { Select } from '../components/ui'

const statusOptions = [
  { value: '', label: 'Todas' },
  { value: 'Active', label: 'Activas' },
  { value: 'Scheduled', label: 'Próximas' },
  { value: 'Finished', label: 'Finalizadas' },
  { value: 'Deserted', label: 'Desiertas' },
]

const priceInputClasses =
  'w-28 rounded-md border border-brand-950/15 bg-white px-3 py-2 text-sm text-brand-950 outline-none transition placeholder:text-brand-950/35 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 dark:border-white/15 dark:bg-night-soft dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-400'

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
      <div className="aspect-[4/3] bg-brand-100 dark:bg-white/5" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-16 rounded bg-brand-100 dark:bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-brand-100 dark:bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-brand-100 dark:bg-white/10" />
      </div>
    </div>
  )
}

export default function Catalog() {
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ status: 'Active', categoryId: '', sort: '', minPrice: '', maxPrice: '' })
  const [priceDraft, setPriceDraft] = useState({ minPrice: '', maxPrice: '' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => toast.error('No se pudieron cargar las categorías'))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAuctions({ ...filters, page, pageSize: 12 })
      .then((data) => !cancelled && setResult(data))
      .catch((error) => !cancelled && toast.error(error.message))
      .finally(() => !cancelled && setLoading(false))
    // el cleanup evita que una respuesta vieja pise a una mas nueva al cambiar filtros rapido
    return () => {
      cancelled = true
    }
  }, [filters, page])

  const changeFilter = (patch) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  const applyPrices = (e) => {
    e.preventDefault()
    changeFilter({ minPrice: priceDraft.minPrice, maxPrice: priceDraft.maxPrice })
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-white">Subastas</h1>
        {result && (
          <span className="text-sm text-brand-950/50 dark:text-white/50">
            {result.totalCount} resultado{result.totalCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-brand-950/15 dark:border-white/15">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => changeFilter({ status: option.value })}
              className={`px-3 py-2 text-sm font-medium transition ${
                filters.status === option.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-brand-950/70 hover:bg-brand-50 dark:bg-night-soft dark:text-white/70 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="w-44">
          <Select
            aria-label="Categoría"
            value={filters.categoryId}
            onChange={(e) => changeFilter({ categoryId: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-40">
          <Select
            aria-label="Ordenar por"
            value={filters.sort}
            onChange={(e) => changeFilter({ sort: e.target.value })}
          >
            <option value="">Termina antes</option>
            <option value="highestPrice">Mayor oferta</option>
          </Select>
        </div>

        <form onSubmit={applyPrices} className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="$ mín"
            aria-label="Precio mínimo"
            className={priceInputClasses}
            value={priceDraft.minPrice}
            onChange={(e) => setPriceDraft({ ...priceDraft, minPrice: e.target.value })}
          />
          <span className="text-brand-950/40 dark:text-white/40">–</span>
          <input
            type="number"
            min="0"
            placeholder="$ máx"
            aria-label="Precio máximo"
            className={priceInputClasses}
            value={priceDraft.maxPrice}
            onChange={(e) => setPriceDraft({ ...priceDraft, maxPrice: e.target.value })}
          />
          <button
            type="submit"
            className="rounded-md border border-brand-950/15 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-white/15 dark:text-brand-300 dark:hover:bg-white/10"
          >
            Aplicar
          </button>
        </form>
      </div>

      {/* Grilla */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : result?.items.length ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="rounded-md border border-brand-950/15 px-3 py-1.5 text-sm font-medium text-brand-950/70 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
            >
              ‹ Anterior
            </button>
            <span className="text-sm tabular-nums text-brand-950/60 dark:text-white/60">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="rounded-md border border-brand-950/15 px-3 py-1.5 text-sm font-medium text-brand-950/70 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
            >
              Siguiente ›
            </button>
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-display text-lg font-semibold text-brand-950 dark:text-white">
            No hay subastas con estos filtros
          </p>
          <button
            onClick={() => {
              setPriceDraft({ minPrice: '', maxPrice: '' })
              changeFilter({ status: '', categoryId: '', sort: '', minPrice: '', maxPrice: '' })
            }}
            className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  )
}

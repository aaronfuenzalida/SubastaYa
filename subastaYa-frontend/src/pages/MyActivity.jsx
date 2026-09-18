import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyAuctions, getMyParticipations } from '../api/me'
import AuctionCard from '../components/AuctionCard'
import { formatDateTime, formatMoney } from '../lib/format'

// El resultado de una participacion se deriva de estado + si mi oferta es la lider
function outcomeOf(p) {
  if (p.status === 'Active')
    return p.isTopBidder
      ? { label: 'Liderando', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' }
      : { label: 'Superado', classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' }
  if (p.status === 'Finished')
    return p.isTopBidder
      ? { label: '🏆 Ganada', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' }
      : { label: 'Perdida', classes: 'bg-brand-50 text-brand-950/60 dark:bg-white/5 dark:text-white/50' }
  if (p.status === 'Scheduled') return { label: 'Próxima', classes: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' }
  return { label: 'Desierta', classes: 'bg-brand-50 text-brand-950/60 dark:bg-white/5 dark:text-white/50' }
}

export default function MyActivity() {
  const [tab, setTab] = useState('bids')
  const [participations, setParticipations] = useState(null)
  const [myAuctions, setMyAuctions] = useState(null)

  useEffect(() => {
    Promise.all([getMyParticipations(), getMyAuctions()])
      .then(([p, a]) => {
        setParticipations(p)
        setMyAuctions(a)
      })
      .catch((error) => toast.error(error.message))
  }, [])

  const tabClasses = (active) =>
    `px-4 py-2 text-sm font-medium transition ${
      active
        ? 'bg-brand-600 text-white'
        : 'bg-white text-brand-950/70 hover:bg-brand-50 dark:bg-night-soft dark:text-white/70 dark:hover:bg-white/10'
    }`

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-white">
        Mis actividades
      </h1>

      <div className="mt-5 inline-flex overflow-hidden rounded-md border border-brand-950/15 dark:border-white/15">
        <button onClick={() => setTab('bids')} className={tabClasses(tab === 'bids')}>
          Mis pujas {participations && `(${participations.length})`}
        </button>
        <button onClick={() => setTab('auctions')} className={tabClasses(tab === 'auctions')}>
          Mis publicaciones {myAuctions && `(${myAuctions.length})`}
        </button>
      </div>

      {tab === 'bids' && (
        <div className="mt-6">
          {!participations ? (
            <div className="h-40 animate-pulse rounded-lg bg-brand-100 dark:bg-white/5" />
          ) : participations.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-950/50 dark:text-white/50">
              Todavía no participaste en ninguna subasta.{' '}
              <Link to="/" className="font-semibold text-brand-600 dark:text-brand-400">
                Explorá el catálogo
              </Link>
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
              {participations.map((p) => {
                const outcome = outcomeOf(p)
                return (
                  <li key={p.auctionId} className="border-b border-brand-950/5 last:border-0 dark:border-white/5">
                    <Link
                      to={`/auctions/${p.auctionId}`}
                      className="flex items-center gap-4 px-4 py-3 transition hover:bg-brand-50/50 dark:hover:bg-white/5"
                    >
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="size-14 shrink-0 rounded-md bg-brand-100 object-cover dark:bg-white/5"
                        onError={(e) => {
                          e.currentTarget.style.visibility = 'hidden'
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-950 dark:text-white">
                          {p.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-brand-950/50 dark:text-white/50">
                          Tu oferta: <span className="tabular-nums">{formatMoney(p.myTopBid)}</span>
                          {' · '}Líder: <span className="tabular-nums">{formatMoney(p.currentPrice)}</span>
                          {' · '}Cierre: {formatDateTime(p.endsAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-semibold ${outcome.classes}`}>
                        {outcome.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'auctions' && (
        <div className="mt-6">
          {!myAuctions ? (
            <div className="h-40 animate-pulse rounded-lg bg-brand-100 dark:bg-white/5" />
          ) : myAuctions.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-950/50 dark:text-white/50">
              No publicaste ninguna subasta.{' '}
              <Link to="/auctions/new" className="font-semibold text-brand-600 dark:text-brand-400">
                Publicá la primera
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

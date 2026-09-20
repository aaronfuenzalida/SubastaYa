import { Link } from 'react-router-dom'
import Countdown from './Countdown'
import { formatMoney } from '../lib/format'

const statusLabels = { Scheduled: 'Próxima', Finished: 'Finalizada', Deserted: 'Desierta' }

export default function AuctionCard({ auction }) {
  const isActive = auction.status === 'Active'

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group overflow-hidden rounded-lg border border-brand-950/10 bg-white transition hover:border-brand-400 dark:border-white/10 dark:bg-night-soft dark:hover:border-brand-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-100 dark:bg-white/5">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          loading="lazy"
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="absolute right-2 top-2 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {isActive ? <Countdown endsAt={auction.endsAt} /> : (statusLabels[auction.status] ?? auction.status)}
        </span>
      </div>

      <div className="p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          {auction.categoryName}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-semibold text-brand-950 dark:text-white">
          {auction.title}
        </h3>
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-brand-950/50 dark:text-white/50">
            {auction.bidsCount === 0
              ? 'Precio base'
              : `${auction.bidsCount} oferta${auction.bidsCount === 1 ? '' : 's'}`}
          </span>
          <span className="font-display text-base font-bold tabular-nums text-brand-950 dark:text-white">
            {formatMoney(auction.currentPrice)}
          </span>
        </div>
      </div>
    </Link>
  )
}

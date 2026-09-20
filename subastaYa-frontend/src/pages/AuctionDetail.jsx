import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAuction } from '../api/auctions'
import { getBids, placeBid } from '../api/bids'
import { useAuth } from '../auth/AuthContext'
import Countdown from '../components/Countdown'
import { PrimaryButton } from '../components/ui'
import { createAuctionConnection } from '../lib/realtime'
import { formatDateTime, formatMoney, formatTime } from '../lib/format'

export default function AuctionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [amount, setAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const [myTopBid, setMyTopBid] = useState(0)

  // refs para que los handlers de SignalR (fuera del ciclo de render) lean valores frescos
  const auctionRef = useRef(null)
  const knownBidIds = useRef(new Set())
  useEffect(() => {
    auctionRef.current = auction
  }, [auction])

  const load = useCallback(async () => {
    try {
      const [auctionData, bidsData] = await Promise.all([getAuction(id), getBids(id)])
      knownBidIds.current = new Set(bidsData.map((b) => b.id))
      setAuction(auctionData)
      setBids(bidsData)
    } catch (error) {
      if (error.status === 404) setNotFound(true)
    }
  }, [id])

  // Carga inicial + suscripcion en tiempo real (reemplaza al short-polling)
  useEffect(() => {
    load()

    // StrictMode monta dos veces en dev: el primer start() queda abortado por el
    // cleanup y su promesa rechaza; "disposed" evita mostrar ese falso error.
    let disposed = false
    const connection = createAuctionConnection()

    connection.on('BidPlaced', (result) => {
      // mi propia puja ya se aplico con la respuesta del POST: el broadcast se ignora
      if (knownBidIds.current.has(result.bid.id)) return
      knownBidIds.current.add(result.bid.id)

      const current = auctionRef.current
      if (current) {
        if (new Date(result.endsAt) > new Date(current.endsAt))
          toast('⏱ Subasta extendida 2 minutos (anti-sniping)')
        if (current.currentUserIsTopBidder)
          toast('📉 ¡Te superaron! Ofertá de nuevo para recuperar el liderazgo')
      }

      setBids((prev) => [result.bid, ...prev])
      setAuction((a) =>
        a
          ? {
              ...a,
              currentPrice: result.currentPrice,
              minNextBid: result.minNextBid,
              endsAt: result.endsAt,
              bidsCount: a.bidsCount + 1,
              // la puja de otro me quita el liderazgo
              currentUserIsTopBidder: false,
            }
          : a,
      )
    })

    // El worker cerro o activo la subasta: refetch completo (trae el flag de ganador)
    connection.on('AuctionStatusChanged', () => load())

    // Si la conexion se cayo, pudimos perder eventos: se resincroniza todo
    connection.onreconnected(() => load())

    connection
      .start()
      .then(() => connection.invoke('JoinAuction', Number(id)))
      .catch(() => {
        if (!disposed) toast.error('Sin conexión en tiempo real — recargá la página')
      })

    return () => {
      disposed = true
      connection.stop()
    }
  }, [id, load])

  const submitBid = async (value) => {
    setPlacing(true)
    try {
      const result = await placeBid(id, Number(value))
      knownBidIds.current.add(result.bid.id)
      setMyTopBid(result.bid.amount)
      setAuction((a) => ({
        ...a,
        currentPrice: result.currentPrice,
        minNextBid: result.minNextBid,
        endsAt: result.endsAt,
        bidsCount: a.bidsCount + 1,
        currentUserIsTopBidder: true,
      }))
      setBids((prev) => [result.bid, ...prev])
      setAmount('')
      toast.success('¡Oferta registrada!')
      if (result.timeExtended) toast('⏱ Cierre extendido 2 minutos (anti-sniping)')
    } catch (error) {
      if (error.status === 409)
        toast.error('Alguien ofertó en este mismo instante. Mirá el precio nuevo e intentá otra vez.')
      else if (error.status === 422)
        toast.error('Saldo disponible insuficiente. Cargá fondos en tu billetera.')
      else toast.error(error.message)
      load()
    } finally {
      setPlacing(false)
    }
  }

  if (notFound)
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-white">
          Subasta no encontrada
        </h1>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-brand-600 dark:text-brand-400">
          Volver al catálogo
        </Link>
      </section>
    )

  if (!auction)
    return (
      <section className="mx-auto max-w-6xl animate-pulse px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="aspect-[4/3] rounded-lg bg-brand-100 dark:bg-white/5" />
          <div className="h-96 rounded-lg bg-brand-100 dark:bg-white/5" />
        </div>
      </section>
    )

  const isActive = auction.status === 'Active'
  const hasEnded = new Date(auction.endsAt).getTime() <= Date.now()
  const isLeading = auction.currentUserIsTopBidder && isActive && !hasEnded
  const hasWon = auction.currentUserIsTopBidder && auction.status === 'Finished'
  const wasOutbid = myTopBid > 0 && !auction.currentUserIsTopBidder
  const isOwnAuction = user && user.name === auction.sellerName
  const canBid = user && isActive && !hasEnded && !isOwnAuction && !isLeading

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm text-brand-950/50 hover:text-brand-600 dark:text-white/50 dark:hover:text-brand-400">
        ‹ Volver al catálogo
      </Link>

      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Columna del producto */}
        <div>
          <div className="overflow-hidden rounded-lg border border-brand-950/10 bg-brand-100 dark:border-white/10 dark:bg-white/5">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="aspect-[4/3] w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {auction.categoryName}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-brand-950 dark:text-white">
            {auction.title}
          </h1>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-brand-950/70 dark:text-white/60">
            {auction.description}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-[13px] text-brand-950/60 dark:text-white/50 sm:grid-cols-4">
            <div>
              <dt>Vendedor</dt>
              <dd className="font-medium text-brand-950 dark:text-white/90">{auction.sellerName}</dd>
            </div>
            <div>
              <dt>Precio base</dt>
              <dd className="font-medium tabular-nums text-brand-950 dark:text-white/90">
                {formatMoney(auction.basePrice)}
              </dd>
            </div>
            <div>
              <dt>Incremento mín.</dt>
              <dd className="font-medium tabular-nums text-brand-950 dark:text-white/90">
                {formatMoney(auction.minIncrement)}
              </dd>
            </div>
            <div>
              <dt>Inicio</dt>
              <dd className="font-medium text-brand-950 dark:text-white/90">
                {formatDateTime(auction.startsAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Panel en vivo */}
        <div className="lg:sticky lg:top-20">
          <div className="rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
            <div className="flex items-center justify-between border-b border-brand-950/10 px-4 py-3 dark:border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
                {isActive && !hasEnded ? 'Finaliza en' : 'Estado'}
              </span>
              <span className="font-display text-lg font-bold text-brand-950 dark:text-white">
                {isActive && !hasEnded ? (
                  <Countdown endsAt={auction.endsAt} light />
                ) : auction.status === 'Scheduled' ? (
                  `Empieza el ${formatDateTime(auction.startsAt)}`
                ) : auction.status === 'Deserted' ? (
                  'Desierta'
                ) : hasEnded && isActive ? (
                  'Cerrando…'
                ) : (
                  'Finalizada'
                )}
              </span>
            </div>

            <div className="px-4 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-brand-950/55 dark:text-white/55">
                  {auction.bidsCount === 0 ? 'Precio base' : 'Oferta más alta'}
                </span>
                <span className="font-display text-3xl font-bold tabular-nums text-brand-950 dark:text-white">
                  {formatMoney(auction.currentPrice)}
                </span>
              </div>
              <p className="mt-1 text-right text-[12px] text-brand-950/45 dark:text-white/40">
                {auction.bidsCount} oferta{auction.bidsCount === 1 ? '' : 's'}
              </p>

              {hasWon && (
                <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  🏆 ¡Ganaste esta subasta por {formatMoney(auction.currentPrice)}!
                </div>
              )}
              {isLeading && (
                <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  🏆 Estás liderando esta subasta
                </div>
              )}
              {wasOutbid && (
                <div className="mt-3 rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  Te superaron — la oferta líder ya no es tuya
                </div>
              )}

              {canBid && (
                <div className="mt-4 space-y-3">
                  <PrimaryButton loading={placing} onClick={() => submitBid(auction.minNextBid)}>
                    {placing ? 'Ofertando…' : `Ofertar ${formatMoney(auction.minNextBid)}`}
                  </PrimaryButton>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      submitBid(amount)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      min={auction.minNextBid}
                      step="1"
                      placeholder={`Otro monto (mín. ${formatMoney(auction.minNextBid)})`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-md border border-brand-950/15 bg-white px-3 py-2 text-sm text-brand-950 outline-none transition placeholder:text-brand-950/35 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 dark:border-white/15 dark:bg-night dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-400"
                    />
                    <button
                      type="submit"
                      disabled={placing || !amount}
                      className="rounded-md border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-white/5"
                    >
                      Ofertar
                    </button>
                  </form>
                </div>
              )}

              {!user && isActive && !hasEnded && (
                <Link
                  to="/login"
                  state={{ from: `/auctions/${id}` }}
                  className="mt-4 block rounded-md bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
                >
                  Ingresá para ofertar
                </Link>
              )}

              {isOwnAuction && (
                <p className="mt-4 rounded-md border border-brand-950/10 bg-brand-50 px-3 py-2 text-sm text-brand-950/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                  Esta es tu publicación — no podés ofertar en ella.
                </p>
              )}
            </div>

            {/* Historial de ofertas */}
            <div className="border-t border-brand-950/10 dark:border-white/10">
              <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
                Historial de ofertas
              </p>
              {bids.length === 0 ? (
                <p className="px-4 py-3 text-sm text-brand-950/45 dark:text-white/40">
                  Todavía no hay ofertas. ¡Sé el primero!
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto px-4 py-2 text-[13px]">
                  {bids.map((bid, index) => (
                    <li key={bid.id} className="flex items-baseline justify-between gap-2 py-1.5">
                      <span className="w-14 text-brand-950/60 dark:text-white/60">{bid.bidder}</span>
                      <span
                        className={`tabular-nums ${
                          index === 0
                            ? 'font-bold text-brand-600 dark:text-brand-400'
                            : 'font-medium text-brand-950/80 dark:text-white/70'
                        }`}
                      >
                        {formatMoney(bid.amount)}
                      </span>
                      <span className="w-20 text-right text-brand-950/40 dark:text-white/40">
                        {formatTime(bid.placedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

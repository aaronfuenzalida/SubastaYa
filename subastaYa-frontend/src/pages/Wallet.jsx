import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { deposit, getBalance, getTransactions } from '../api/wallet'
import { Field, PrimaryButton } from '../components/ui'
import { formatDateTime, formatMoney } from '../lib/format'

// Etiqueta, signo y color por tipo de asiento. El signo refleja el efecto
// sobre tu poder de compra (saldo disponible), no un debe/haber contable.
const typeInfo = {
  Deposit: { label: 'Depósito', sign: '+', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  Hold: { label: 'Retención', sign: '−', classes: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' },
  Release: { label: 'Liberación', sign: '+', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  Payment: { label: 'Pago', sign: '−', classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' },
  Payout: { label: 'Cobro', sign: '+', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
}

function StatCard({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 dark:bg-night-soft ${
        highlight
          ? 'border-brand-600/40 dark:border-brand-400/40'
          : 'border-brand-950/10 dark:border-white/10'
      }`}
    >
      <p className="text-[12px] font-medium text-brand-950/55 dark:text-white/55">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold tabular-nums ${
          highlight ? 'text-brand-600 dark:text-brand-400' : 'text-brand-950 dark:text-white'
        }`}
      >
        {formatMoney(value)}
      </p>
    </div>
  )
}

export default function Wallet() {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  const load = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([getBalance(), getTransactions()])
      setBalance(balanceData)
      setTransactions(transactionsData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositing(true)
    try {
      // el POST ya devuelve los saldos actualizados y la pantalla refresca al instante
      const newBalance = await deposit(Number(amount))
      setBalance(newBalance)
      setAmount('')
      toast.success(`Acreditamos ${formatMoney(Number(amount))} en tu billetera`)
      setTransactions(await getTransactions())
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDepositing(false)
    }
  }

  if (loading || !balance)
    return (
      <section className="mx-auto max-w-5xl animate-pulse px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-brand-100 dark:bg-white/5" />
          ))}
        </div>
      </section>
    )

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-white">Billetera</h1>
      <p className="mt-1 text-sm text-brand-950/55 dark:text-white/55">
        El saldo en garantía respalda tus ofertas líderes y se libera si te superan.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Saldo total" value={balance.totalBalance} />
        <StatCard label="En garantía" value={balance.heldBalance} />
        <StatCard label="Disponible para ofertar" value={balance.availableBalance} highlight />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Historial de movimientos */}
        <div className="overflow-hidden rounded-lg border border-brand-950/10 bg-white dark:border-white/10 dark:bg-night-soft">
          <p className="border-b border-brand-950/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:border-white/10 dark:text-white/60">
            Historial de movimientos
          </p>
          {transactions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-brand-950/45 dark:text-white/40">
              Sin movimientos todavía. Cargá saldo para empezar a ofertar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <tbody>
                  {transactions.map((t) => {
                    const info = typeInfo[t.type] ?? { label: t.type, sign: '', classes: '' }
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-brand-950/5 last:border-0 dark:border-white/5"
                      >
                        <td className="px-4 py-2.5">
                          <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${info.classes}`}>
                            {info.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-brand-950/50 dark:text-white/50">
                          {t.auctionId ? (
                            <Link
                              to={`/auctions/${t.auctionId}`}
                              className="hover:text-brand-600 dark:hover:text-brand-400"
                            >
                              Subasta #{t.auctionId}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-brand-950/45 dark:text-white/40">
                          {formatDateTime(t.createdAt)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums text-brand-950 dark:text-white/90">
                          {info.sign} {formatMoney(t.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Carga simulada */}
        <aside className="rounded-lg border border-brand-950/10 bg-white p-4 dark:border-white/10 dark:bg-night-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-950/60 dark:text-white/60">
            Cargar saldo
          </p>
          <form onSubmit={handleDeposit} className="mt-3 space-y-3">
            <Field
              label="Monto ($)"
              type="number"
              min={1}
              max={10_000_000}
              required
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <PrimaryButton type="submit" loading={depositing}>
              {depositing ? 'Acreditando…' : 'Cargar saldo'}
            </PrimaryButton>
          </form>
          <p className="mt-3 text-[12px] text-brand-950/45 dark:text-white/40">
            Carga simulada: acredita fondos ficticios para operar en la plataforma.
          </p>
        </aside>
      </div>
    </section>
  )
}

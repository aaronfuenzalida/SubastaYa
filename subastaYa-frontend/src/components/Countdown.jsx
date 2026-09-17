import { useEffect, useState } from 'react'

function format(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Cuenta regresiva viva: ultimo minuto en rojo pulsante, ultimos 5 en ambar
// (zona critica del TP). "light" usa tonos para fondo claro (la sala en vivo);
// el default esta pensado para el chip oscuro de las cards.
export default function Countdown({ endsAt, light = false }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const msLeft = new Date(endsAt).getTime() - now
  if (msLeft <= 0) return <span>Finalizada</span>

  const urgent = msLeft <= 60_000
  const warning = !urgent && msLeft <= 5 * 60_000

  const urgentClasses = light ? 'text-red-600 dark:text-red-400' : 'text-red-300'
  const warningClasses = light ? 'text-amber-600 dark:text-amber-400' : 'text-amber-300'

  return (
    <span
      className={`tabular-nums ${
        urgent
          ? `animate-pulse font-semibold ${urgentClasses}`
          : warning
            ? `font-medium ${warningClasses}`
            : ''
      }`}
    >
      {format(msLeft)}
    </span>
  )
}

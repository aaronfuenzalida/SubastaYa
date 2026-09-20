const moneyFormat = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function formatMoney(value) {
  return moneyFormat.format(value)
}

const dateTimeFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatDateTime(value) {
  return dateTimeFormat.format(new Date(value))
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-AR')
}

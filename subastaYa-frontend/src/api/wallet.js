import { api } from './client'

export function getBalance() {
  return api('/wallet')
}

export function deposit(amount) {
  return api('/wallet/deposits', { method: 'POST', body: { amount } })
}

export function getTransactions() {
  return api('/wallet/transactions')
}

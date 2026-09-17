import { api } from './client'

export function getAuctions(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) query.set(key, value)
  })
  return api(`/auctions?${query}`)
}

export function getCategories() {
  return api('/categories')
}

export function getAuction(id) {
  return api(`/auctions/${id}`)
}

export function createAuction(data) {
  return api('/auctions', { method: 'POST', body: data })
}

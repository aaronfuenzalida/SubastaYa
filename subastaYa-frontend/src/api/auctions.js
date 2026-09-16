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

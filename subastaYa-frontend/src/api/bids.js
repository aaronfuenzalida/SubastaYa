import { api } from './client'

export function getBids(auctionId) {
  return api(`/auctions/${auctionId}/bids`)
}

export function placeBid(auctionId, amount) {
  return api(`/auctions/${auctionId}/bids`, { method: 'POST', body: { amount } })
}

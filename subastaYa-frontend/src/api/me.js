import { api } from './client'

export function getMyParticipations() {
  return api('/me/participations')
}

export function getMyAuctions() {
  return api('/me/auctions')
}

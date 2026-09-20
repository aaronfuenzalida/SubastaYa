import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

// El hub vive en la raiz del server (no bajo /api/v1)
const HUB_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:5267/api/v1').replace('/api/v1', '') +
  '/hubs/auctions'

export function createAuctionConnection() {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, { withCredentials: false })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()
}

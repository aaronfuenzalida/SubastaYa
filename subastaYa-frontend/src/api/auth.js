import { api } from './client'

export function login(email, password) {
  return api('/sessions', { method: 'POST', body: { email, password } })
}

export function register(name, email, password) {
  return api('/users', { method: 'POST', body: { name, email, password } })
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5267/api/v1'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = 'Ocurrió un error inesperado'
    try {
      const data = await response.json()
      // El back devuelve { error } para reglas de negocio y { errors } para validaciones
      message = data.error ?? (data.errors ? Object.values(data.errors).flat().join(' ') : message)
    } catch {
      /* respuesta sin body */
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return null
  return response.json()
}

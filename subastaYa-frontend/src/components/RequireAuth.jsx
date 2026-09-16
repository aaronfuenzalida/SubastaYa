import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Envuelve rutas que requieren sesion: si no hay usuario, manda a /login
// recordando de donde venia para volver despues del login.
export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

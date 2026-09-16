import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'
import RequireAuth from './components/RequireAuth'
import Catalog from './pages/Catalog'
import Login from './pages/Login'
import Register from './pages/Register'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/auctions/:id" element={<Placeholder title="Sala de subasta" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/auctions/new"
            element={
              <RequireAuth>
                <Placeholder title="Publicar subasta" />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <Placeholder title="Billetera" />
              </RequireAuth>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireAuth>
                <Placeholder title="Mis actividades" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Placeholder title="Página no encontrada" />} />
        </Routes>
      </main>
      <ThemeToggle />
    </div>
  )
}

import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Placeholder title="Catálogo de subastas" />} />
          <Route path="/auctions/new" element={<Placeholder title="Publicar subasta" />} />
          <Route path="/auctions/:id" element={<Placeholder title="Sala de subasta" />} />
          <Route path="/wallet" element={<Placeholder title="Billetera" />} />
          <Route path="/activity" element={<Placeholder title="Mis actividades" />} />
          <Route path="/login" element={<Placeholder title="Ingresar" />} />
          <Route path="/register" element={<Placeholder title="Crear cuenta" />} />
          <Route path="*" element={<Placeholder title="Página no encontrada" />} />
        </Routes>
      </main>
    </div>
  )
}

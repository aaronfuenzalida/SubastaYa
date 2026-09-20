import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'
import RequireAuth from './components/RequireAuth'
import AuctionDetail from './pages/AuctionDetail'
import Catalog from './pages/Catalog'
import CreateAuction from './pages/CreateAuction'
import Login from './pages/Login'
import Register from './pages/Register'
import MyActivity from './pages/MyActivity'
import Placeholder from './pages/Placeholder'
import Wallet from './pages/Wallet'

export default function App() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/auctions/new"
            element={
              <RequireAuth>
                <CreateAuction />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <Wallet />
              </RequireAuth>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireAuth>
                <MyActivity />
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

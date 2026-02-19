import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import MarketingHome from './pages/MarketingHome'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import AddOutfit from './pages/AddOutfit'
import OutfitDetail from './pages/OutfitDetail'
import SharedOutfit from './pages/SharedOutfit'
import Wardrobe from './pages/Wardrobe'
import AddPiece from './pages/AddPiece'
import PieceDetail from './pages/PieceDetail'
import Settings from './pages/Settings'
import About from './pages/About'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/app" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mg-bg">
      <p className="font-heading text-xl text-mg-text">Marginalia</p>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Marketing site */}
      <Route path="/" element={<MarketingHome />} />

      {/* Shared outfit (public, no /app prefix) */}
      <Route path="/outfit/:slug" element={<SharedOutfit />} />

      {/* App auth routes */}
      <Route path="/app" element={user ? <Navigate to="/app/outfits" replace /> : <Landing />} />
      <Route path="/app/signup" element={user ? <Navigate to="/app/outfits" replace /> : <SignUp />} />
      <Route path="/app/signin" element={user ? <Navigate to="/app/outfits" replace /> : <SignIn />} />
      <Route path="/app/forgot-password" element={<ForgotPassword />} />
      <Route path="/app/reset-password" element={<ResetPassword />} />

      {/* App protected routes */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="outfits" element={<Home />} />
        <Route path="outfits/new" element={<AddOutfit />} />
        <Route path="outfits/:id" element={<OutfitDetail />} />
        <Route path="pieces" element={<Wardrobe />} />
        <Route path="pieces/new" element={<AddPiece />} />
        <Route path="pieces/:id" element={<PieceDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

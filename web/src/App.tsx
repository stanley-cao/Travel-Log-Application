import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import AppLayout from './components/AppLayout'
import TripsPage from './pages/TripsPage'
import MapPage from './pages/MapPage'
import StatsPage from './pages/StatsPage'
import TripDetailPage from './pages/TripDetailPage'
import PlannerPage from './pages/PlannerPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <BrowserRouter>
      <AppLayout user={user}>
        <Routes>
          <Route path="/" element={<Navigate to="/trips" replace />} />
          <Route path="/trips" element={<TripsPage userId={user.id} />} />
          <Route path="/trips/:id" element={<TripDetailPage userId={user.id} />} />
          <Route path="/map" element={<MapPage userId={user.id} />} />
          <Route path="/stats" element={<StatsPage userId={user.id} />} />
          <Route path="/planner" element={<PlannerPage userId={user.id} />} />
          <Route path="*" element={<Navigate to="/trips" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { Map, BarChart2, Compass, LogOut, Globe, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface Props {
  user: User
  children: ReactNode
}

const NAV_ITEMS = [
  { label: 'My Trips', icon: Compass, path: '/trips' },
  { label: 'Trip Planner', icon: BookOpen, path: '/planner' },
  { label: 'World Map', icon: Map, path: '/map' },
  { label: 'Statistics', icon: BarChart2, path: '/stats' },
]

export default function AppLayout({ user, children }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Globe size={20} color="var(--terracotta)" />
            <h1>Travel Logger</h1>
          </div>
          <span>{user.email}</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              className={`nav-item ${location.pathname.startsWith(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleSignOut} style={{ width: '100%' }}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
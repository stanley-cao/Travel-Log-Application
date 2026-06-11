import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { TripFormData } from '../types'
import TripCard from '../components/TripCard'
import TripForm from '../components/TripForm'

interface Props { userId: string }

type SortKey = 'date_desc' | 'date_asc' | 'rating' | 'alpha'

export default function TripsPage({ userId }: Props) {
  const navigate = useNavigate()
  const { trips, loading, addTrip } = useTrips(userId)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date_desc')
  const [filterCountry, setFilterCountry] = useState('')

  const countries = useMemo(() => [...new Set(trips.map(t => t.country))].sort(), [trips])

  const filtered = useMemo(() => {
    let result = [...trips]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
    if (filterCountry) result = result.filter(t => t.country === filterCountry)
    switch (sortBy) {
      case 'date_asc': result.sort((a, b) => a.start_date.localeCompare(b.start_date)); break
      case 'date_desc': result.sort((a, b) => b.start_date.localeCompare(a.start_date)); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'alpha': result.sort((a, b) => a.title.localeCompare(b.title)); break
    }
    return result
  }, [trips, search, sortBy, filterCountry])

  const handleAdd = async (data: TripFormData) => {
    await addTrip(data, userId)
    setShowForm(false)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>My Trips</h2>
          <p style={{ fontSize: 13, color: 'var(--sand-500)', marginTop: 2 }}>
            {trips.length} {trips.length === 1 ? 'adventure' : 'adventures'} logged
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Log New Trip
        </button>
      </div>

      <div className="page-body">
        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              className="form-input"
              placeholder="Search trips, cities, countries, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={15} color="var(--sand-500)" />
            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="rating">Top Rated</option>
              <option value="alpha">A–Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌍</div>
            <h3>No trips logged yet</h3>
            <p>Start documenting your adventures around the world.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Log Your First Trip
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No matches found</h3>
            <p>Try a different search or filter.</p>
          </div>
        ) : (
          <div className="trip-grid">
            {filtered.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate(`/trips/${trip.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TripForm onSave={handleAdd} onClose={() => setShowForm(false)} />
      )}
    </>
  )
}

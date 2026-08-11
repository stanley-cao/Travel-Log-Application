import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { getYear, parseISO } from 'date-fns'
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
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  const countries = useMemo(() => [...new Set(trips.map(t => t.country))].sort(), [trips])
  const years = useMemo(() =>
    [...new Set(trips.map(t => String(getYear(parseISO(t.start_date)))))]
      .sort((a, b) => Number(b) - Number(a)),
    [trips]
  )

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const activeFilterCount = [filterCountry, filterYear, filterMonth].filter(Boolean).length

  const clearFilters = () => {
    setFilterCountry('')
    setFilterYear('')
    setFilterMonth('')
    setSearch('')
  }

  const filtered = useMemo(() => {
    let result = [...trips]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        (t.stops?.some(s => s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)))
      )
    }

    if (filterCountry) result = result.filter(t => t.country === filterCountry)

    if (filterYear) {
      result = result.filter(t => String(getYear(parseISO(t.start_date))) === filterYear)
    }

    if (filterMonth) {
      const monthIdx = MONTHS.indexOf(filterMonth)
      result = result.filter(t => {
        const start = parseISO(t.start_date)
        const end = parseISO(t.end_date)
        // Trip overlaps with this month in any year
        for (let y = getYear(start); y <= getYear(end); y++) {
          const tripStartMonth = y === getYear(start) ? start.getMonth() : 0
          const tripEndMonth = y === getYear(end) ? end.getMonth() : 11
          if (monthIdx >= tripStartMonth && monthIdx <= tripEndMonth) return true
        }
        return false
      })
    }

    switch (sortBy) {
      case 'date_asc':  result.sort((a, b) => a.start_date.localeCompare(b.start_date)); break
      case 'date_desc': result.sort((a, b) => b.start_date.localeCompare(a.start_date)); break
      case 'rating':    result.sort((a, b) => b.rating - a.rating); break
      case 'alpha':     result.sort((a, b) => a.title.localeCompare(b.title)); break
    }
    return result
  }, [trips, search, sortBy, filterCountry, filterYear, filterMonth])

  const handleAdd = async (data: TripFormData): Promise<string | null> => {
    const err = await addTrip(data, userId)
    if (!err) setShowForm(false)
    return err
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
        {/* Filter bar */}
        <div style={{ marginBottom: 20 }}>
          {/* Row 1: search + sort */}
          <div className="filter-bar" style={{ marginBottom: 10 }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                className="form-input"
                placeholder="Search trips, cities, countries, tags…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
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

          {/* Row 2: filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sand-500)', fontSize: 13 }}>
              <SlidersHorizontal size={14} />
              <span>Filter:</span>
            </div>

            {/* Country filter */}
            <select
              className="form-input"
              style={{ width: 'auto', fontSize: 13 }}
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Year filter */}
            <select
              className="form-input"
              style={{ width: 'auto', fontSize: 13 }}
              value={filterYear}
              onChange={e => { setFilterYear(e.target.value); setFilterMonth('') }}
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Month filter — only shown if a year is selected */}
            {filterYear && (
              <select
                className="form-input"
                style={{ width: 'auto', fontSize: 13 }}
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {/* Active filter chips + clear */}
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                {filterCountry && (
                  <span className="chip">
                    {filterCountry}
                    <button type="button" onClick={() => setFilterCountry('')}><X size={11} /></button>
                  </span>
                )}
                {filterYear && (
                  <span className="chip">
                    {filterYear}
                    <button type="button" onClick={() => { setFilterYear(''); setFilterMonth('') }}><X size={11} /></button>
                  </span>
                )}
                {filterMonth && (
                  <span className="chip">
                    {filterMonth}
                    <button type="button" onClick={() => setFilterMonth('')}><X size={11} /></button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none', border: 'none', fontSize: 12,
                    color: 'var(--sand-500)', cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Result count when filtering */}
            {(activeFilterCount > 0 || search) && (
              <span style={{ fontSize: 12, color: 'var(--sand-400)', marginLeft: 'auto' }}>
                {filtered.length} of {trips.length} trips
              </span>
            )}
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
            <h3>No trips match these filters</h3>
            <p>Try adjusting the filters or search term.</p>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
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
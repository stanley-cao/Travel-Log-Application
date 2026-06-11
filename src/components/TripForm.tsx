import { useState, useEffect } from 'react'
import { X, MapPin } from 'lucide-react'
import { Trip, TripFormData } from '../types'
import StarRating from './StarRating'
import TagInput from './TagInput'

interface Props {
  trip?: Trip | null
  onSave: (data: TripFormData) => Promise<void>
  onClose: () => void
}

const EMPTY: TripFormData = {
  title: '', country: '', city: '',
  latitude: null, longitude: null,
  start_date: '', end_date: '',
  rating: 5, notes: '', tags: []
}

// Geocode a city using Nominatim (OpenStreetMap) - free, no key needed
async function geocode(city: string, country: string): Promise<{ lat: number; lon: number } | null> {
  const q = encodeURIComponent(`${city}, ${country}`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  return null
}

export default function TripForm({ trip, onSave, onClose }: Props) {
  const [form, setForm] = useState<TripFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (trip) {
      setForm({
        title: trip.title, country: trip.country, city: trip.city,
        latitude: trip.latitude, longitude: trip.longitude,
        start_date: trip.start_date, end_date: trip.end_date,
        rating: trip.rating, notes: trip.notes || '', tags: trip.tags
      })
    } else {
      setForm(EMPTY)
    }
  }, [trip])

  const set = (key: keyof TripFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleLookup = async () => {
    if (!form.city || !form.country) return
    setGeocoding(true)
    const result = await geocode(form.city, form.country)
    if (result) {
      set('latitude', result.lat)
      set('longitude', result.lon)
    } else {
      setError('Could not find coordinates. Please check the city and country.')
    }
    setGeocoding(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude) {
      setError('Please look up the coordinates for your destination.')
      return
    }
    if (form.end_date < form.start_date) {
      setError('End date cannot be before start date.')
      return
    }
    setLoading(true)
    setError(null)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{trip ? 'Edit Trip' : 'Log a New Trip'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Trip Title</label>
              <input
                className="form-input"
                placeholder="e.g. Cherry Blossom Season in Kyoto"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-input"
                  placeholder="e.g. Tokyo"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  className="form-input"
                  placeholder="e.g. Japan"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Coordinates</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleLookup}
                  disabled={!form.city || !form.country || geocoding}
                >
                  <MapPin size={13} />
                  {geocoding ? 'Looking up…' : 'Auto-detect'}
                </button>
              </div>
              <div className="form-row">
                <input
                  className="form-input"
                  type="number"
                  placeholder="Latitude"
                  value={form.latitude ?? ''}
                  onChange={e => set('latitude', parseFloat(e.target.value) || null)}
                  step="any"
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Longitude"
                  value={form.longitude ?? ''}
                  onChange={e => set('longitude', parseFloat(e.target.value) || null)}
                  step="any"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.start_date}
                  onChange={e => set('start_date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.end_date}
                  onChange={e => set('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              <StarRating value={form.rating} onChange={v => set('rating', v)} size={28} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <TagInput tags={form.tags} onChange={v => set('tags', v)} />
            </div>

            <div className="form-group">
              <label className="form-label">Journal Notes</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Write about your experience, highlights, tips for next time…"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                color: '#DC2626', padding: '10px 14px', borderRadius: 8,
                fontSize: 13, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {trip ? 'Save Changes' : 'Log Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { X, MapPin, Plus, Trash2 } from 'lucide-react'
import { Trip, TripFormData, CityStop } from '../types'
import StarRating from './StarRating'
import TagInput from './TagInput'

interface Props {
  trip?: Trip | null
  onSave: (data: TripFormData) => Promise<string | null>
  onClose: () => void
}

const EMPTY_STOP: CityStop = { city: '', country: '', latitude: 0, longitude: 0 }

const EMPTY: TripFormData = {
  title: '', stops: [{ ...EMPTY_STOP }],
  city: '', country: '', latitude: null, longitude: null,
  start_date: '', end_date: '',
  rating: 5, notes: '', tags: []
}

async function geocode(city: string, country: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${country}`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch (_) {}
  return null
}

export default function TripForm({ trip, onSave, onClose }: Props) {
  const [form, setForm] = useState<TripFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [geocodingIdx, setGeocodingIdx] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (trip) {
      const stops = trip.stops?.length
        ? trip.stops
        : [{ city: trip.city, country: trip.country, latitude: trip.latitude, longitude: trip.longitude }]
      setForm({
        title: trip.title,
        stops,
        city: trip.city, country: trip.country,
        latitude: trip.latitude, longitude: trip.longitude,
        start_date: trip.start_date, end_date: trip.end_date,
        rating: trip.rating, notes: trip.notes || '', tags: trip.tags
      })
    } else {
      setForm(EMPTY)
    }
  }, [trip])

  const setField = (key: keyof TripFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const updateStop = (idx: number, key: keyof CityStop, value: string | number) => {
    setForm(prev => {
      const stops = prev.stops.map((s, i) => i === idx ? { ...s, [key]: value } : s)
      return { ...prev, stops }
    })
  }

  const addStop = () => {
    setForm(prev => ({ ...prev, stops: [...prev.stops, { ...EMPTY_STOP }] }))
  }

  const removeStop = (idx: number) => {
    setForm(prev => ({ ...prev, stops: prev.stops.filter((_, i) => i !== idx) }))
  }

  const handleGeocode = async (idx: number) => {
    const stop = form.stops[idx]
    if (!stop.city || !stop.country) return
    setGeocodingIdx(idx)
    const result = await geocode(stop.city, stop.country)
    if (result) {
      setForm(prev => {
        const stops = prev.stops.map((s, i) =>
          i === idx ? { ...s, latitude: result.lat, longitude: result.lon } : s
        )
        return { ...prev, stops }
      })
    } else {
      setError(`Could not find coordinates for "${stop.city}, ${stop.country}". Try a different spelling.`)
    }
    setGeocodingIdx(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.stops.length || !form.stops[0].city) {
      setError('Please add at least one city.')
      return
    }
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      setError('End date cannot be before start date.')
      return
    }

    setLoading(true)

    // Auto-geocode any stops missing coordinates
    let stops = [...form.stops]
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].city && stops[i].country && (!stops[i].latitude && !stops[i].longitude)) {
        setGeocodingIdx(i)
        const result = await geocode(stops[i].city, stops[i].country)
        if (result) {
          stops[i] = { ...stops[i], latitude: result.lat, longitude: result.lon }
        }
      }
    }
    setGeocodingIdx(null)

    // Derive primary city/country/coords from first stop
    const primary = stops[0]
    const finalForm: TripFormData = {
      ...form,
      stops,
      city: primary.city,
      country: primary.country,
      latitude: primary.latitude || 0,
      longitude: primary.longitude || 0,
    }

    const err = await onSave(finalForm)
    if (err) {
      setError(`Failed to save: ${err}`)
      setLoading(false)
    }
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Trip Title</label>
              <input
                className="form-input"
                placeholder="e.g. Europe Summer 2025"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                required
              />
            </div>

            {/* City stops */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Cities Visited
                </label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addStop}>
                  <Plus size={13} /> Add City
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.stops.map((stop, idx) => (
                  <div key={idx} style={{
                    border: '1px solid var(--sand-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    background: 'var(--sand-50)',
                    position: 'relative',
                  }}>
                    {/* Stop label */}
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--sand-400)',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10
                    }}>
                      {idx === 0 ? 'Primary Destination' : `Stop ${idx + 1}`}
                    </div>

                    {/* City + Country */}
                    <div className="form-row" style={{ marginBottom: 10 }}>
                      <div>
                        <input
                          className="form-input"
                          placeholder="City (e.g. Paris)"
                          value={stop.city}
                          onChange={e => updateStop(idx, 'city', e.target.value)}
                          required={idx === 0}
                        />
                      </div>
                      <div>
                        <input
                          className="form-input"
                          placeholder="Country (e.g. France)"
                          value={stop.country}
                          onChange={e => updateStop(idx, 'country', e.target.value)}
                          required={idx === 0}
                        />
                      </div>
                    </div>

                    {/* Coordinates row */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Latitude"
                        value={stop.latitude || ''}
                        onChange={e => updateStop(idx, 'latitude', parseFloat(e.target.value) || 0)}
                        step="any"
                        style={{ flex: 1 }}
                      />
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Longitude"
                        value={stop.longitude || ''}
                        onChange={e => updateStop(idx, 'longitude', parseFloat(e.target.value) || 0)}
                        step="any"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={() => handleGeocode(idx)}
                        disabled={!stop.city || !stop.country || geocodingIdx === idx}
                      >
                        <MapPin size={12} />
                        {geocodingIdx === idx ? 'Finding…' : 'Auto-detect'}
                      </button>
                    </div>

                    {/* Detected coords confirmation */}
                    {stop.latitude !== 0 && stop.longitude !== 0 && (
                      <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✓ Located at {stop.latitude.toFixed(3)}, {stop.longitude.toFixed(3)}
                      </div>
                    )}

                    {/* Remove button (not on first stop if only 1 stop) */}
                    {form.stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStop(idx)}
                        style={{
                          position: 'absolute', top: 10, right: 10,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--sand-400)', display: 'flex', alignItems: 'center',
                          padding: 4, borderRadius: 4,
                        }}
                        title="Remove this city"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.start_date}
                  onChange={e => setField('start_date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.end_date}
                  onChange={e => setField('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating</label>
              <StarRating value={form.rating} onChange={v => setField('rating', v)} size={28} />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags</label>
              <TagInput tags={form.tags} onChange={v => setField('tags', v)} />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Journal Notes</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Write about your experience, highlights, tips for next time…"
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
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
              <button type="submit" className="btn btn-primary" disabled={loading || geocodingIdx !== null}>
                {(loading || geocodingIdx !== null) ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {loading ? 'Saving…' : geocodingIdx !== null ? 'Detecting…' : trip ? 'Save Changes' : 'Log Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
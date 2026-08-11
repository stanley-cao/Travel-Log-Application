import { useState } from 'react'
import { Plus, MapPin, Calendar, Trash2, CheckCircle, ChevronRight, Clock } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { usePlanner } from '../hooks/Useplanner'
import { useTrips } from '../hooks/useTrips'
import { PlannedTrip, PlannedTripFormData } from '../types/planner'
import { TripFormData } from '../types'
import PlanDetailPage from './Plandetailpage'

interface Props { userId: string }

const EMOJIS = ['✈️','🏖️','🏔️','🗺️','🌍','🎒','🏛️','🌴','🗼','🏯','🌋','🚢','🏕️','🎡','🌸']

export default function PlannerPage({ userId }: Props) {
  const { plans, loading, createPlan, deletePlan, markCompleted, updatePlan } = usePlanner(userId)
  const { addTrip } = useTrips(userId)
  const [showForm, setShowForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlannedTrip | null>(null)
  const [form, setForm] = useState<PlannedTripFormData>({
    title: '', destination: '', country: '',
    start_date: '', end_date: '', cover_emoji: '✈️', notes: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'planning' | 'completed'>('planning')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const err = await createPlan(form)
    if (err) { setFormError(err); setSaving(false); return }
    setShowForm(false)
    setSaving(false)
    setForm({ title: '', destination: '', country: '', start_date: '', end_date: '', cover_emoji: '✈️', notes: '' })
  }

  const handleMarkComplete = async (e: React.MouseEvent, plan: PlannedTrip) => {
    e.stopPropagation()
    if (!confirm(`Mark "${plan.title}" as completed? This will also add it to your trip log.`)) return

    // Convert to logged trip
    const tripData: TripFormData = {
      title: plan.title,
      stops: plan.destination ? [{ city: plan.destination, country: plan.country, latitude: 0, longitude: 0 }] : [],
      city: plan.destination || '',
      country: plan.country || '',
      latitude: null,
      longitude: null,
      start_date: plan.start_date || new Date().toISOString().split('T')[0],
      end_date: plan.end_date || new Date().toISOString().split('T')[0],
      rating: 5,
      notes: plan.notes || '',
      tags: [],
    }
    await addTrip(tripData, userId)
    await markCompleted(plan.id)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this plan?')) return
    await deletePlan(id)
  }

  if (selectedPlan) {
    const live = plans.find(p => p.id === selectedPlan.id) || selectedPlan
    return <PlanDetailPage userId={userId} plan={live} onBack={() => setSelectedPlan(null)} />
  }

  const filtered = plans.filter(p => p.status === tab)

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Trip Planner</h2>
          <p style={{ fontSize: 13, color: 'var(--sand-500)', marginTop: 2 }}>
            {plans.filter(p => p.status === 'planning').length} upcoming {plans.filter(p => p.status === 'planning').length === 1 ? 'adventure' : 'adventures'} planned
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Plan New Trip
        </button>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'planning' ? 'active' : ''}`} onClick={() => setTab('planning')}>
            Upcoming ({plans.filter(p => p.status === 'planning').length})
          </button>
          <button className={`tab-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>
            Completed ({plans.filter(p => p.status === 'completed').length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{tab === 'planning' ? '🗺️' : '✅'}</div>
            <h3>{tab === 'planning' ? 'No trips planned yet' : 'No completed plans'}</h3>
            <p>{tab === 'planning' ? 'Start planning your next adventure.' : 'Mark a planned trip as completed once you\'ve taken it.'}</p>
            {tab === 'planning' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Plan New Trip
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(plan => {
              const days = plan.start_date && plan.end_date
                ? Math.max(1, differenceInDays(parseISO(plan.end_date), parseISO(plan.start_date)) + 1)
                : null
              const daysUntil = plan.start_date
                ? differenceInDays(parseISO(plan.start_date), new Date())
                : null
              const placesTotal = plan.places?.length || 0
              const placesDone = plan.places?.filter(p => p.done).length || 0
              const packedTotal = plan.packing?.length || 0
              const packedDone = plan.packing?.filter(p => p.packed).length || 0
              const budgetTotal = plan.budget?.reduce((s, b) => s + b.estimated, 0) || 0

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    background: 'var(--white)', border: '1px solid var(--sand-200)',
                    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
                    cursor: 'pointer', transition: 'all 0.15s', display: 'flex',
                    alignItems: 'center', gap: 20,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sand-300)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sand-200)'
                  }}
                >
                  {/* Emoji */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: 'var(--sand-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0
                  }}>
                    {plan.cover_emoji}
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>
                        {plan.title}
                      </span>
                      {plan.status === 'completed' && (
                        <span style={{
                          background: 'var(--teal-light)', color: 'var(--teal-dark)',
                          borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600
                        }}>✓ Completed</span>
                      )}
                      {plan.status === 'planning' && daysUntil !== null && daysUntil >= 0 && (
                        <span style={{
                          background: 'var(--gold-light)', color: '#7A5800',
                          borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <Clock size={10} />
                          {daysUntil === 0 ? 'Today!' : `${daysUntil}d away`}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {plan.destination && (
                        <span style={{ fontSize: 13, color: 'var(--sand-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {plan.destination}{plan.country ? `, ${plan.country}` : ''}
                        </span>
                      )}
                      {plan.start_date && (
                        <span style={{ fontSize: 13, color: 'var(--sand-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {format(parseISO(plan.start_date), 'MMM d')}
                          {plan.end_date ? ` – ${format(parseISO(plan.end_date), 'MMM d, yyyy')}` : ''}
                          {days ? ` · ${days}d` : ''}
                        </span>
                      )}
                    </div>

                    {/* Progress pills */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {placesTotal > 0 && (
                        <span className="tag">{placesDone}/{placesTotal} places</span>
                      )}
                      {packedTotal > 0 && (
                        <span className="tag">{packedDone}/{packedTotal} packed</span>
                      )}
                      {budgetTotal > 0 && (
                        <span className="tag">Budget: ${budgetTotal.toLocaleString()}</span>
                      )}
                      {plan.itinerary?.length > 0 && (
                        <span className="tag">{plan.itinerary.length} day itinerary</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {plan.status === 'planning' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={e => handleMarkComplete(e, plan)}
                        title="Mark as completed"
                        style={{ color: 'var(--teal)' }}
                      >
                        <CheckCircle size={14} /> Done
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={e => handleDelete(e, plan.id)}
                      title="Delete plan"
                      style={{ color: 'var(--sand-400)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} color="var(--sand-300)" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New plan modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Plan New Trip</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                {/* Emoji picker */}
                <div className="form-group">
                  <label className="form-label">Cover Emoji</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {EMOJIS.map(e => (
                      <button
                        key={e} type="button"
                        onClick={() => setForm(f => ({ ...f, cover_emoji: e }))}
                        style={{
                          width: 40, height: 40, fontSize: 22, borderRadius: 8,
                          border: form.cover_emoji === e ? '2px solid var(--terracotta)' : '2px solid var(--sand-200)',
                          background: form.cover_emoji === e ? 'var(--terracotta-light)' : 'var(--white)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >{e}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Trip Title</label>
                  <input className="form-input" placeholder="e.g. Japan Spring 2026" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City / Region</label>
                    <input className="form-input" placeholder="e.g. Tokyo" value={form.destination}
                      onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" placeholder="e.g. Japan" value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" type="date" value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" type="date" value={form.end_date}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Goals</label>
                  <textarea className="form-input form-textarea" placeholder="What do you want to do on this trip?"
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                {formError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
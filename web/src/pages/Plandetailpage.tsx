import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Check, MapPin, Utensils, Eye, ShoppingBag, Calendar, DollarSign, CheckSquare, Package } from 'lucide-react'
import { format, parseISO, addDays, differenceInDays } from 'date-fns'
import { PlannedTrip, PlaceItem, BudgetItem, PackingItem, ItineraryDay } from '../types/planner'
import { usePlanner } from '../hooks/Useplanner'

interface Props {
  userId: string
  plan: PlannedTrip
  onBack: () => void
}

type Tab = 'itinerary' | 'places' | 'budget' | 'packing'

const BUDGET_CATEGORIES = ['Flights', 'Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other']
const PACKING_CATEGORIES = ['Clothing', 'Toiletries', 'Documents', 'Electronics', 'Health', 'Other']
const PLACE_TYPES: { value: PlaceItem['type']; label: string; icon: typeof MapPin }[] = [
  { value: 'sight', label: 'Sight', icon: Eye },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'activity', label: 'Activity', icon: ShoppingBag },
  { value: 'other', label: 'Other', icon: MapPin },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function PlanDetailPage({ plan, onBack, userId }: Props) {
  const { updatePlaces, updateBudget, updatePacking, updateItinerary } = usePlanner(userId)
  const [tab, setTab] = useState<Tab>('itinerary')

  // Local state — synced to DB on each change
  const [places, setPlaces] = useState<PlaceItem[]>(plan.places || [])
  const [budget, setBudget] = useState<BudgetItem[]>(plan.budget || [])
  const [packing, setPacking] = useState<PackingItem[]>(plan.packing || [])
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(plan.itinerary || [])

  // --- Helpers ---
  const syncPlaces = async (next: PlaceItem[]) => { setPlaces(next); await updatePlaces(plan.id, next) }
  const syncBudget = async (next: BudgetItem[]) => { setBudget(next); await updateBudget(plan.id, next) }
  const syncPacking = async (next: PackingItem[]) => { setPacking(next); await updatePacking(plan.id, next) }
  const syncItinerary = async (next: ItineraryDay[]) => { setItinerary(next); await updateItinerary(plan.id, next) }

  // --- Itinerary ---
  const tripDays = plan.start_date && plan.end_date
    ? Math.max(1, differenceInDays(parseISO(plan.end_date), parseISO(plan.start_date)) + 1)
    : 0

  const getDayDate = (idx: number) => plan.start_date
    ? format(addDays(parseISO(plan.start_date), idx), 'MMM d, yyyy')
    : `Day ${idx + 1}`

  const getDay = (idx: number): ItineraryDay =>
    itinerary[idx] || { date: getDayDate(idx), activities: [] }

  const addActivity = async (dayIdx: number, text: string) => {
    if (!text.trim()) return
    const days = Array.from({ length: tripDays }, (_, i) => getDay(i))
    days[dayIdx] = { ...days[dayIdx], activities: [...days[dayIdx].activities, text.trim()] }
    await syncItinerary(days)
  }

  const removeActivity = async (dayIdx: number, actIdx: number) => {
    const days = Array.from({ length: tripDays }, (_, i) => getDay(i))
    days[dayIdx] = { ...days[dayIdx], activities: days[dayIdx].activities.filter((_, i) => i !== actIdx) }
    await syncItinerary(days)
  }

  // --- Places ---
  const addPlace = async (name: string, type: PlaceItem['type'], notes: string) => {
    const next = [...places, { id: uid(), name, type, notes, done: false }]
    await syncPlaces(next)
  }
  const togglePlace = async (id: string) => {
    const next = places.map(p => p.id === id ? { ...p, done: !p.done } : p)
    await syncPlaces(next)
  }
  const removePlace = async (id: string) => syncPlaces(places.filter(p => p.id !== id))

  // --- Budget ---
  const addBudgetItem = async (label: string, category: string, estimated: number) => {
    const next = [...budget, { id: uid(), label, category, estimated, actual: undefined }]
    await syncBudget(next)
  }
  const updateActual = async (id: string, actual: number) => {
    const next = budget.map(b => b.id === id ? { ...b, actual } : b)
    await syncBudget(next)
  }
  const removeBudgetItem = async (id: string) => syncBudget(budget.filter(b => b.id !== id))

  // --- Packing ---
  const addPackingItem = async (label: string, category: string) => {
    const next = [...packing, { id: uid(), label, category, packed: false }]
    await syncPacking(next)
  }
  const togglePacked = async (id: string) => {
    const next = packing.map(p => p.id === id ? { ...p, packed: !p.packed } : p)
    await syncPacking(next)
  }
  const removePackingItem = async (id: string) => syncPacking(packing.filter(p => p.id !== id))

  const totalEstimated = budget.reduce((s, b) => s + (b.estimated || 0), 0)
  const totalActual = budget.reduce((s, b) => s + (b.actual || 0), 0)
  const packedCount = packing.filter(p => p.packed).length
  const placesDone = places.filter(p => p.done).length

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={onBack}><ArrowLeft size={18} /></button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{plan.cover_emoji}</span>
              <h2 style={{ fontSize: 20 }}>{plan.title}</h2>
            </div>
            {plan.destination && (
              <div style={{ fontSize: 13, color: 'var(--sand-500)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {plan.destination}{plan.country ? `, ${plan.country}` : ''}
                {plan.start_date && <> · {format(parseISO(plan.start_date), 'MMM d')} – {plan.end_date ? format(parseISO(plan.end_date), 'MMM d, yyyy') : '?'}</>}
              </div>
            )}
          </div>
        </div>
        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="tag">{placesDone}/{places.length} places</span>
          <span className="tag">{packedCount}/{packing.length} packed</span>
          {totalEstimated > 0 && <span className="tag">${totalEstimated.toLocaleString()} budget</span>}
        </div>
      </div>

      <div className="page-body">
        <div className="tab-bar">
          {([
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'places', label: `Places (${places.length})`, icon: MapPin },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'packing', label: `Packing (${packedCount}/${packing.length})`, icon: Package },
          ] as const).map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id as Tab)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ITINERARY ── */}
        {tab === 'itinerary' && (
          <div>
            {tripDays === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>No dates set</h3>
                <p>Edit this plan to add start and end dates, then build your day-by-day itinerary.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: tripDays }, (_, dayIdx) => {
                  const day = getDay(dayIdx)
                  return <DayCard key={dayIdx} dayIdx={dayIdx} label={getDayDate(dayIdx)} activities={day.activities}
                    onAdd={text => addActivity(dayIdx, text)} onRemove={actIdx => removeActivity(dayIdx, actIdx)} />
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PLACES ── */}
        {tab === 'places' && (
          <div>
            <AddPlaceForm onAdd={addPlace} />
            {places.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">📍</div>
                <h3>No places added yet</h3>
                <p>Add sights, restaurants, and activities you want to visit.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {PLACE_TYPES.map(({ value, label, icon: Icon }) => {
                  const group = places.filter(p => p.type === value)
                  if (!group.length) return null
                  return (
                    <div key={value}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, marginTop: 8 }}>
                        <Icon size={13} /> {label}s
                      </div>
                      {group.map(place => (
                        <div key={place.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                          background: 'var(--white)', border: '1px solid var(--sand-200)',
                          borderRadius: 'var(--radius-md)', marginBottom: 6,
                          opacity: place.done ? 0.6 : 1
                        }}>
                          <button onClick={() => togglePlace(place.id)} style={{
                            width: 22, height: 22, borderRadius: 6, border: place.done ? 'none' : '2px solid var(--sand-300)',
                            background: place.done ? 'var(--teal)' : 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {place.done && <Check size={13} color="white" strokeWidth={3} />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, textDecoration: place.done ? 'line-through' : 'none', color: 'var(--sand-900)' }}>{place.name}</div>
                            {place.notes && <div style={{ fontSize: 12, color: 'var(--sand-500)', marginTop: 2 }}>{place.notes}</div>}
                          </div>
                          <button onClick={() => removePlace(place.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand-300)', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BUDGET ── */}
        {tab === 'budget' && (
          <div>
            <AddBudgetForm onAdd={addBudgetItem} />
            {budget.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">💰</div>
                <h3>No budget items yet</h3>
                <p>Add flights, accommodation, food, and other expenses to track your budget.</p>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {/* Summary bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Estimated', value: `$${totalEstimated.toLocaleString()}`, color: 'var(--sand-900)' },
                    { label: 'Actual Spent', value: `$${totalActual.toLocaleString()}`, color: totalActual > totalEstimated ? '#DC2626' : 'var(--teal)' },
                    { label: 'Remaining', value: `$${(totalEstimated - totalActual).toLocaleString()}`, color: 'var(--sand-500)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="stat-card" style={{ padding: 16 }}>
                      <div className="stat-label">{label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {BUDGET_CATEGORIES.map(cat => {
                  const items = budget.filter(b => b.category === cat)
                  if (!items.length) return null
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{cat}</div>
                      {items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                          background: 'var(--white)', border: '1px solid var(--sand-200)',
                          borderRadius: 'var(--radius-md)', marginBottom: 6
                        }}>
                          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                          <div style={{ fontSize: 13, color: 'var(--sand-500)', minWidth: 80 }}>Est: ${item.estimated}</div>
                          <input
                            type="number" placeholder="Actual $"
                            value={item.actual ?? ''}
                            onChange={e => updateActual(item.id, parseFloat(e.target.value) || 0)}
                            style={{ width: 90, padding: '5px 8px', border: '1px solid var(--sand-200)', borderRadius: 6, fontSize: 13 }}
                          />
                          <button onClick={() => removeBudgetItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand-300)', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PACKING ── */}
        {tab === 'packing' && (
          <div>
            <AddPackingForm onAdd={addPackingItem} />
            {packing.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">🧳</div>
                <h3>Packing list is empty</h3>
                <p>Add everything you need to pack for this trip.</p>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--sand-500)', marginBottom: 14 }}>
                  {packedCount} of {packing.length} items packed
                  <div style={{ marginTop: 6, height: 6, background: 'var(--sand-200)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${packing.length ? (packedCount / packing.length) * 100 : 0}%`, background: 'var(--teal)', borderRadius: 99, transition: 'width 0.3s' }} />
                  </div>
                </div>
                {PACKING_CATEGORIES.map(cat => {
                  const items = packing.filter(p => p.category === cat)
                  if (!items.length) return null
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{cat}</div>
                      {items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
                          background: 'var(--white)', border: '1px solid var(--sand-200)',
                          borderRadius: 'var(--radius-md)', marginBottom: 5,
                          opacity: item.packed ? 0.6 : 1
                        }}>
                          <button onClick={() => togglePacked(item.id)} style={{
                            width: 22, height: 22, borderRadius: 6,
                            border: item.packed ? 'none' : '2px solid var(--sand-300)',
                            background: item.packed ? 'var(--teal)' : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {item.packed && <Check size={13} color="white" strokeWidth={3} />}
                          </button>
                          <span style={{ flex: 1, fontSize: 14, textDecoration: item.packed ? 'line-through' : 'none' }}>{item.label}</span>
                          <button onClick={() => removePackingItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand-300)', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────

function DayCard({ dayIdx, label, activities, onAdd, onRemove }: {
  dayIdx: number; label: string; activities: string[]
  onAdd: (text: string) => void; onRemove: (i: number) => void
}) {
  const [input, setInput] = useState('')
  const submit = () => { if (input.trim()) { onAdd(input); setInput('') } }
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'var(--terracotta)', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>Day {dayIdx + 1}</span>
          {label}
        </div>
        {activities.map((act, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--sand-100)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terracotta)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14 }}>{act}</span>
            <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand-300)', padding: 2 }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input className="form-input" placeholder="Add an activity…" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), submit())}
            style={{ flex: 1, fontSize: 13 }} />
          <button className="btn btn-secondary btn-sm" onClick={submit}><Plus size={13} /></button>
        </div>
      </div>
    </div>
  )
}

function AddPlaceForm({ onAdd }: { onAdd: (name: string, type: PlaceItem['type'], notes: string) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<PlaceItem['type']>('sight')
  const [notes, setNotes] = useState('')
  const submit = () => { if (name.trim()) { onAdd(name, type, notes); setName(''); setNotes('') } }
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Add a Place</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Place name" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), submit())} style={{ flex: 2, minWidth: 160 }} />
          <select className="form-input" value={type} onChange={e => setType(e.target.value as PlaceItem['type'])} style={{ flex: 1, minWidth: 110 }}>
            <option value="sight">👁️ Sight</option>
            <option value="restaurant">🍽️ Restaurant</option>
            <option value="activity">🎯 Activity</option>
            <option value="other">📌 Other</option>
          </select>
          <input className="form-input" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ flex: 2, minWidth: 160 }} />
          <button className="btn btn-primary btn-sm" onClick={submit}><Plus size={13} /> Add</button>
        </div>
      </div>
    </div>
  )
}

function AddBudgetForm({ onAdd }: { onAdd: (label: string, category: string, estimated: number) => void }) {
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('Flights')
  const [estimated, setEstimated] = useState('')
  const submit = () => {
    if (label.trim() && estimated) {
      onAdd(label, category, parseFloat(estimated))
      setLabel(''); setEstimated('')
    }
  }
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Add Budget Item</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Description" value={label} onChange={e => setLabel(e.target.value)} style={{ flex: 2, minWidth: 160 }} />
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: 120 }}>
            {['Flights','Accommodation','Food','Transport','Activities','Shopping','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="form-input" type="number" placeholder="Est. $" value={estimated} onChange={e => setEstimated(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), submit())} style={{ width: 90 }} />
          <button className="btn btn-primary btn-sm" onClick={submit}><Plus size={13} /> Add</button>
        </div>
      </div>
    </div>
  )
}

function AddPackingForm({ onAdd }: { onAdd: (label: string, category: string) => void }) {
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('Clothing')
  const submit = () => { if (label.trim()) { onAdd(label, category); setLabel('') } }
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Add Item</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Item to pack" value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), submit())} style={{ flex: 2, minWidth: 160 }} />
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: 120 }}>
            {['Clothing','Toiletries','Documents','Electronics','Health','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={submit}><Plus size={13} /> Add</button>
        </div>
      </div>
    </div>
  )
}
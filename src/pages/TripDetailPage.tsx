import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Upload, Camera, MapPin, Calendar, X } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { TripFormData } from '../types'
import StarRating from '../components/StarRating'
import TripForm from '../components/TripForm'

interface Props { userId: string }

export default function TripDetailPage({ userId }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trips, updateTrip, deleteTrip, updateCoverImage } = useTrips(userId)
  const trip = trips.find(t => t.id === id)
  const { photos, uploading, uploadPhoto, deletePhoto } = usePhotos(id || null, userId)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState<'journal' | 'photos'>('journal')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!trip) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <p>Trip not found.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/trips')}>
            <ArrowLeft size={14} /> Back to Trips
          </button>
        </div>
      </div>
    )
  }

  const nights = Math.max(1, differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1)

  const handleUpdate = async (data: TripFormData): Promise<string | null> => {
    const err = await updateTrip(trip.id, data)
    if (!err) setShowEdit(false)
    return err
  }

  const handleDelete = async () => {
    if (!confirm('Delete this trip? This cannot be undone.')) return
    await deleteTrip(trip.id)
    navigate('/trips')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const url = await uploadPhoto(file)
      // Set cover if this is the first photo or no cover is set
      if (url && (!trip.cover_image_url || photos.length === 0)) {
        await updateCoverImage(trip.id, url)
      }
    }
    e.target.value = ''
  }

  const handleSetCover = async (url: string) => {
    await updateCoverImage(trip.id, url)
  }

  const handleDeletePhoto = async (photo: import('../types').TripPhoto) => {
    const wasCover = trip.cover_image_url === photo.url
    await deletePhoto(photo)
    if (wasCover) {
      // Find another photo to use as cover, or clear it
      const remaining = photos.filter(p => p.id !== photo.id)
      if (remaining.length > 0) {
        await updateCoverImage(trip.id, remaining[0].url)
      } else {
        await updateCoverImage(trip.id, '')
      }
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/trips')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: 18 }}>{trip.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sand-500)', marginTop: 2 }}>
              <MapPin size={12} />
              {trip.stops?.length > 1
                ? trip.stops.map(s => s.city).join(' → ')
                : `${trip.city}, ${trip.country}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>
            <Edit2 size={13} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Hero */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="trip-detail-hero">
            {trip.cover_image_url
              ? <img src={trip.cover_image_url} alt={trip.title} />
              : <div className="trip-detail-hero-placeholder">🌍</div>
            }
          </div>
          <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div className="stat-label">Dates</div>
              <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="var(--sand-500)" />
                {format(parseISO(trip.start_date), 'MMM d, yyyy')} →{' '}
                {format(parseISO(trip.end_date), 'MMM d, yyyy')}
              </div>
              <div className="stat-sub">{nights} {nights === 1 ? 'day' : 'days'}</div>
            </div>
            <div>
              <div className="stat-label">Rating</div>
              <StarRating value={trip.rating} readOnly size={20} />
            </div>
            {trip.tags.length > 0 && (
              <div>
                <div className="stat-label">Tags</div>
                <div className="tags-row" style={{ marginTop: 0 }}>
                  {trip.tags.map(tag => <span key={tag} className="tag tag-terracotta">{tag}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            Journal Notes
          </button>
          <button className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            Photos {photos.length > 0 && `(${photos.length})`}
          </button>
        </div>

        {activeTab === 'journal' && (
          <div className="card">
            <div className="card-body">
              {trip.notes ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 15, color: 'var(--sand-900)' }}>
                  {trip.notes}
                </div>
              ) : (
                <div style={{ color: 'var(--sand-500)', fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>
                  No journal notes yet. Edit this trip to add your memories.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {photos.length === 0 ? (
              <div
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={32} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 500, marginBottom: 4 }}>Add photos from this trip</p>
                <p style={{ fontSize: 13 }}>Click to upload — supports JPG, PNG, WebP</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={13} />
                    {uploading ? 'Uploading…' : 'Upload Photos'}
                  </button>
                </div>
                <div className="photo-grid">
                  {photos.map(photo => (
                    <div key={photo.id} className="photo-item" onClick={() => setLightbox(photo.url)}>
                      <img src={photo.url} alt={photo.caption || ''} />
                      <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
                        <button
                          className="photo-delete"
                          style={{ position: 'static', opacity: 1, fontSize: 11 }}
                          onClick={e => { e.stopPropagation(); handleSetCover(photo.url) }}
                          title="Set as cover"
                        >
                          Cover
                        </button>
                      </div>
                      <button
                        className="photo-delete"
                        onClick={e => { e.stopPropagation(); handleDeletePhoto(photo) }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
            alt=""
          />
          <button
            style={{
              position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)',
              border: 'none', color: 'white', borderRadius: 8, padding: 8, cursor: 'pointer'
            }}
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {showEdit && (
        <TripForm trip={trip} onSave={handleUpdate} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
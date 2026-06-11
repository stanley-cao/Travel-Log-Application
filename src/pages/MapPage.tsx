import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useTrips } from '../hooks/useTrips'
import { format, parseISO } from 'date-fns'

interface Props { userId: string }

// Custom marker icon
const markerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#C4623A"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
})

export default function MapPage({ userId }: Props) {
  const navigate = useNavigate()
  const { trips, loading } = useTrips(userId)

  return (
    <>
      <div className="page-header">
        <div>
          <h2>World Map</h2>
          <p style={{ fontSize: 13, color: 'var(--sand-500)', marginTop: 2 }}>
            {trips.length} {trips.length === 1 ? 'destination' : 'destinations'} across{' '}
            {new Set(trips.map(t => t.country)).size} {new Set(trips.map(t => t.country)).size === 1 ? 'country' : 'countries'}
          </p>
        </div>
      </div>

      <div style={{ height: 'calc(100vh - 65px)', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        )}
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {trips.map(trip => (
            <Marker
              key={trip.id}
              position={[trip.latitude, trip.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  {trip.cover_image_url && (
                    <img
                      src={trip.cover_image_url}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                      alt=""
                    />
                  )}
                  <div className="map-popup-title">{trip.title}</div>
                  <div className="map-popup-sub">{trip.city}, {trip.country}</div>
                  <div className="map-popup-sub" style={{ marginTop: 4 }}>
                    {format(parseISO(trip.start_date), 'MMM d')} – {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {'★'.repeat(trip.rating)}{'☆'.repeat(5 - trip.rating)}
                  </div>
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    style={{
                      marginTop: 10, width: '100%', padding: '6px 0',
                      background: 'var(--terracotta)', color: 'white', border: 'none',
                      borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500
                    }}
                  >
                    View Trip →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        {trips.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 24, left: 24, zIndex: 500,
            background: 'white', borderRadius: 10, padding: '12px 16px',
            boxShadow: 'var(--shadow-md)', fontSize: 13, minWidth: 140
          }}>
            <div style={{ fontWeight: 500, marginBottom: 8, color: 'var(--sand-900)' }}>Your Travels</div>
            <div style={{ color: 'var(--sand-500)', lineHeight: 1.8 }}>
              <div>🗺️ {trips.length} trips logged</div>
              <div>🌍 {new Set(trips.map(t => t.country)).size} countries</div>
              <div>🏙️ {new Set(trips.map(t => t.city)).size} cities</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useTrips } from '../hooks/useTrips'
import { format, parseISO } from 'date-fns'

interface Props { userId: string }

const markerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa([
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">',
    '<defs>',
    '<radialGradient id="sg" cx="35%" cy="30%" r="65%">',
    '<stop offset="0%" stop-color="#FF7070"/>',
    '<stop offset="45%" stop-color="#C4623A"/>',
    '<stop offset="100%" stop-color="#7A2E10"/>',
    '</radialGradient>',
    '</defs>',
    '<g transform="rotate(-30, 18, 22)">',
    '<line x1="18" y1="17" x2="18" y2="43" stroke="rgba(0,0,0,0.25)" stroke-width="2.5" stroke-linecap="round"/>',
    '<line x1="17" y1="16" x2="17" y2="42" stroke="#AAAAAA" stroke-width="1.8" stroke-linecap="round"/>',
    '<circle cx="19" cy="12" r="10" fill="rgba(0,0,0,0.2)"/>',
    '<circle cx="17" cy="11" r="10" fill="url(#sg)" stroke="white" stroke-width="1.8"/>',
    '<ellipse cx="13" cy="7" rx="3.8" ry="2.5" fill="rgba(255,255,255,0.55)" transform="rotate(-25,13,7)"/>',
    '</g>',
    '</svg>'
  ].join('')),
  iconSize: [36, 44],
  iconAnchor: [12, 42],
  popupAnchor: [6, -42],
})

// Google Maps tile layers
const MAP_STYLES = {
  roadmap: {
    label: 'Map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=en',
  },
  hybrid: {
    label: 'Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=en',
  },
}

import { useState } from 'react'

export default function MapPage({ userId }: Props) {
  const navigate = useNavigate()
  const { trips, loading } = useTrips(userId)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('roadmap')

  const countryCount = new Set(trips.map(t => t.country)).size
  const cityCount = new Set(trips.map(t => t.city)).size

  return (
    <>
      <div className="page-header">
        <div>
          <h2>World Map</h2>
          <p style={{ fontSize: 13, color: 'var(--sand-500)', marginTop: 2 }}>
            {trips.length} {trips.length === 1 ? 'destination' : 'destinations'} across{' '}
            {countryCount} {countryCount === 1 ? 'country' : 'countries'}
          </p>
        </div>

        {/* Map style switcher */}
        <div style={{
          display: 'flex', gap: 4, background: 'var(--sand-100)',
          borderRadius: 8, padding: 4
        }}>
          {(Object.keys(MAP_STYLES) as (keyof typeof MAP_STYLES)[]).map(style => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: mapStyle === style ? 'white' : 'transparent',
                color: mapStyle === style ? 'var(--sand-900)' : 'var(--sand-500)',
                boxShadow: mapStyle === style ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {MAP_STYLES[style].label}
            </button>
          ))}
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
          zoomControl={true}
        >
          <TileLayer
            key={mapStyle}
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url={MAP_STYLES[mapStyle].url}
            maxZoom={20}
          />

          {trips.flatMap(trip => {
            const stops = trip.stops?.length
              ? trip.stops
              : [{ city: trip.city, country: trip.country, latitude: trip.latitude, longitude: trip.longitude }]
            return stops
              .filter(s => s.latitude !== 0 || s.longitude !== 0)
              .map((stop, idx) => (
                <Marker
                  key={`${trip.id}-${idx}`}
                  position={[stop.latitude, stop.longitude]}
                  icon={markerIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 190, fontFamily: 'var(--font-body)' }}>
                      {idx === 0 && trip.cover_image_url && (
                        <img
                          src={trip.cover_image_url}
                          style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
                          alt=""
                        />
                      )}
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
                        {trip.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--sand-500)', marginBottom: 4 }}>
                        📍 {stop.city}, {stop.country}
                        {stops.length > 1 && (
                          <span style={{ marginLeft: 6, background: 'var(--sand-100)', borderRadius: 99, padding: '1px 6px', fontSize: 11 }}>
                            Stop {idx + 1} of {stops.length}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--sand-500)', marginBottom: 4 }}>
                        📅 {format(parseISO(trip.start_date), 'MMM d')} – {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                      </div>
                      <div style={{ fontSize: 14, color: '#C49A2A', marginBottom: 10 }}>
                        {'★'.repeat(trip.rating)}
                        <span style={{ color: 'var(--sand-300)' }}>{'★'.repeat(5 - trip.rating)}</span>
                      </div>
                      {trip.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          {trip.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              background: 'var(--terracotta-light)', color: 'var(--terracotta-dark)',
                              borderRadius: 99, padding: '2px 7px', fontSize: 11
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        style={{
                          width: '100%', padding: '7px 0',
                          background: 'var(--terracotta)', color: 'white', border: 'none',
                          borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500
                        }}
                      >
                        View Trip →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))
          })}
        </MapContainer>

        {/* Stats legend */}
        {trips.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 32, left: 16, zIndex: 500,
            background: 'white', borderRadius: 10, padding: '12px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)', fontSize: 13, minWidth: 150
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--sand-900)', fontFamily: 'var(--font-display)' }}>
              Your Travels
            </div>
            <div style={{ color: 'var(--sand-600)', lineHeight: 2 }}>
              <div>🗺️ <strong>{trips.length}</strong> trips</div>
              <div>🌍 <strong>{countryCount}</strong> countries</div>
              <div>🏙️ <strong>{cityCount}</strong> cities</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
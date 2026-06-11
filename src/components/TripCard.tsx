import { Trip } from '../types'
import { format, parseISO, differenceInDays } from 'date-fns'
import { MapPin, Calendar } from 'lucide-react'
import StarRating from './StarRating'

interface Props {
  trip: Trip
  onClick: () => void
}

const FLAG_EMOJIS: Record<string, string> = {
  'Japan': '🇯🇵', 'France': '🇫🇷', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Germany': '🇩🇪',
  'Australia': '🇦🇺', 'Canada': '🇨🇦', 'Brazil': '🇧🇷', 'Mexico': '🇲🇽',
  'Thailand': '🇹🇭', 'Portugal': '🇵🇹', 'Greece': '🇬🇷', 'Netherlands': '🇳🇱',
  'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Turkey': '🇹🇷', 'India': '🇮🇳',
  'China': '🇨🇳', 'South Korea': '🇰🇷', 'Indonesia': '🇮🇩', 'Vietnam': '🇻🇳',
  'Singapore': '🇸🇬', 'New Zealand': '🇳🇿', 'South Africa': '🇿🇦',
  'UAE': '🇦🇪', 'Morocco': '🇲🇦', 'Egypt': '🇪🇬', 'Argentina': '🇦🇷',
}

export default function TripCard({ trip, onClick }: Props) {
  const flag = FLAG_EMOJIS[trip.country] || '🌍'
  const nights = Math.max(1, differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1)

  return (
    <div className="trip-card" onClick={onClick}>
      <div className="trip-card-cover">
        {trip.cover_image_url
          ? <img src={trip.cover_image_url} alt={trip.title} />
          : (
            <div className="trip-card-cover-placeholder">
              {flag}
            </div>
          )
        }
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 6, padding: '4px 8px', fontSize: 12,
          fontWeight: 500, color: 'var(--sand-900)'
        }}>
          {nights} {nights === 1 ? 'day' : 'days'}
        </div>
      </div>

      <div className="trip-card-body">
        <div className="trip-card-title">{trip.title}</div>
        <div className="trip-card-location">
          <MapPin size={12} />
          {trip.city}, {trip.country}
        </div>
        <div className="trip-card-meta">
          <div className="date-badge">
            <Calendar size={12} />
            {format(parseISO(trip.start_date), 'MMM yyyy')}
          </div>
          <StarRating value={trip.rating} readOnly size={14} />
        </div>
        {trip.tags.length > 0 && (
          <div className="tags-row" style={{ marginTop: 8 }}>
            {trip.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {trip.tags.length > 3 && (
              <span className="tag">+{trip.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

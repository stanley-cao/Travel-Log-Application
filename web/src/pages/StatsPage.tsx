import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useTrips } from '../hooks/useTrips'
import { computeStats } from '../lib/stats'

interface Props { userId: string }

const PIE_COLORS = ['#C4623A', '#2A7A6E', '#C49A2A', '#7F77DD', '#D85A30', '#1D9E75', '#BA7517']

export default function StatsPage({ userId }: Props) {
  const { trips, loading } = useTrips(userId)
  const stats = useMemo(() => computeStats(trips), [trips])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <>
        <div className="page-header"><h2>Statistics</h2></div>
        <div className="page-body">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No data yet</h3>
            <p>Log some trips to see your travel statistics.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h2>Statistics</h2>
      </div>
      <div className="page-body">
        {/* Summary cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Trips</div>
            <div className="stat-value">{stats.totalTrips}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Countries</div>
            <div className="stat-value">{stats.totalCountries}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cities</div>
            <div className="stat-value">{stats.totalCities}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Days Abroad</div>
            <div className="stat-value">{stats.totalDays}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Rating</div>
            <div className="stat-value">{stats.avgRating}</div>
            <div className="stat-sub">out of 5.0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top Country</div>
            <div className="stat-value" style={{ fontSize: 20, paddingTop: 4 }}>{stats.topCountry}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Trips per year */}
          {stats.tripsPerYear.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 16, marginBottom: 20 }}>Trips per Year</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.tripsPerYear} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sand-200)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--sand-500)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--sand-500)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--sand-200)', fontSize: 13 }}
                      cursor={{ fill: 'var(--sand-50)' }}
                    />
                    <Bar dataKey="count" name="Trips" fill="#C4623A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Continent breakdown */}
          {stats.continentBreakdown.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 16, marginBottom: 20 }}>By Continent</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.continentBreakdown}
                      dataKey="count"
                      nameKey="continent"
                      cx="50%" cy="50%"
                      outerRadius={80}
                      label={({ continent, percent }) =>
                        `${continent} ${Math.round(percent * 100)}%`
                      }
                      labelLine={true}
                    >
                      {stats.continentBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--sand-200)', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Top tags */}
        {stats.topTags.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Most Used Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {stats.topTags.map(({ tag, count }) => (
                  <div key={tag} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: 'var(--sand-50)',
                    border: '1px solid var(--sand-200)',
                    borderRadius: 99,
                    fontSize: 14
                  }}>
                    <span style={{ color: 'var(--sand-900)', fontWeight: 500 }}>{tag}</span>
                    <span style={{
                      background: 'var(--terracotta)', color: 'white',
                      borderRadius: 99, padding: '2px 7px', fontSize: 12, fontWeight: 500
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

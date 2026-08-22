import { Trip, StatsData } from '../types'
import { differenceInDays, parseISO, getYear } from 'date-fns'

const CONTINENT_MAP: Record<string, string> = {
  'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
  'Brazil': 'South America', 'Argentina': 'South America', 'Colombia': 'South America',
  'Chile': 'South America', 'Peru': 'South America',
  'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe',
  'Spain': 'Europe', 'Portugal': 'Europe', 'Netherlands': 'Europe', 'Switzerland': 'Europe',
  'Austria': 'Europe', 'Belgium': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe',
  'Denmark': 'Europe', 'Finland': 'Europe', 'Poland': 'Europe', 'Czech Republic': 'Europe',
  'Hungary': 'Europe', 'Greece': 'Europe', 'Turkey': 'Europe', 'Croatia': 'Europe',
  'Japan': 'Asia', 'China': 'Asia', 'South Korea': 'Asia', 'Thailand': 'Asia',
  'Vietnam': 'Asia', 'Indonesia': 'Asia', 'India': 'Asia', 'Singapore': 'Asia',
  'Malaysia': 'Asia', 'Philippines': 'Asia', 'Taiwan': 'Asia', 'Cambodia': 'Asia',
  'Nepal': 'Asia', 'Sri Lanka': 'Asia', 'Bangladesh': 'Asia',
  'Australia': 'Oceania', 'New Zealand': 'Oceania',
  'South Africa': 'Africa', 'Kenya': 'Africa', 'Morocco': 'Africa', 'Egypt': 'Africa',
  'Tanzania': 'Africa', 'Nigeria': 'Africa', 'Ghana': 'Africa',
  'UAE': 'Middle East', 'Israel': 'Middle East', 'Jordan': 'Middle East', 'Qatar': 'Middle East',
}

export function getContinent(country: string): string {
  return CONTINENT_MAP[country] || 'Other'
}

export function computeStats(trips: Trip[]): StatsData {
  if (!trips.length) {
    return {
      totalTrips: 0, totalCountries: 0, totalCities: 0, totalDays: 0,
      topCountry: '—', avgRating: 0,
      tripsPerYear: [], topTags: [], continentBreakdown: []
    }
  }

  const countries = [...new Set(trips.map(t => t.country))]
  const cities = [...new Set(trips.map(t => t.city))]
  const totalDays = trips.reduce((acc, t) => {
    return acc + Math.max(1, differenceInDays(parseISO(t.end_date), parseISO(t.start_date)) + 1)
  }, 0)

  const countryCount = trips.reduce<Record<string, number>>((acc, t) => {
    acc[t.country] = (acc[t.country] || 0) + 1
    return acc
  }, {})
  const topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  const avgRating = trips.reduce((acc, t) => acc + t.rating, 0) / trips.length

  const yearCount = trips.reduce<Record<string, number>>((acc, t) => {
    const year = String(getYear(parseISO(t.start_date)))
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})
  const tripsPerYear = Object.entries(yearCount)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const tagCount = trips.flatMap(t => t.tags).reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {})
  const topTags = Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const continentCount = trips.reduce<Record<string, number>>((acc, t) => {
    const c = getContinent(t.country)
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const continentBreakdown = Object.entries(continentCount)
    .map(([continent, count]) => ({ continent, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalTrips: trips.length, totalCountries: countries.length,
    totalCities: cities.length, totalDays,
    topCountry, avgRating: Math.round(avgRating * 10) / 10,
    tripsPerYear, topTags, continentBreakdown
  }
}

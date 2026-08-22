import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Trip, TripFormData } from '../types'

export function useTrips(userId: string | null) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('trips').select('*').eq('user_id', userId)
      .order('start_date', { ascending: false })
    if (error) setError(error.message)
    else setTrips(data as Trip[])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const addTrip = async (formData: TripFormData, userId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('trips')
      .insert([{ ...formData, user_id: userId, stops: formData.stops ?? [] }])
      .select().single()
    if (error) return error.message
    setTrips(prev => [data as Trip, ...prev])
    return null
  }

  const updateTrip = async (id: string, formData: Partial<TripFormData>): Promise<string | null> => {
    const { data, error } = await supabase
      .from('trips').update(formData).eq('id', id).select().single()
    if (error) return error.message
    setTrips(prev => prev.map(t => t.id === id ? data as Trip : t))
    return null
  }

  const deleteTrip = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) return false
    setTrips(prev => prev.filter(t => t.id !== id))
    return true
  }

  const updateCoverImage = async (id: string, url: string): Promise<void> => {
    const value = url || null
    await supabase.from('trips').update({ cover_image_url: value }).eq('id', id)
    setTrips(prev => prev.map(t => t.id === id ? { ...t, cover_image_url: value } : t))
  }

  return { trips, loading, error, fetchTrips, addTrip, updateTrip, deleteTrip, updateCoverImage }
}

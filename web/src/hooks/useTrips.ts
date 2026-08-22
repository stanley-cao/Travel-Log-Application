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
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
    if (error) {
      console.error('fetchTrips error:', error)
      setError(error.message)
    } else {
      setTrips(data as Trip[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  // Returns null on success, error string on failure
  const addTrip = async (formData: TripFormData, userId: string): Promise<string | null> => {
    const payload = { ...formData, user_id: userId, stops: formData.stops ?? [] }
    console.log('Inserting trip:', payload)
    const { data, error } = await supabase
      .from('trips')
      .insert([payload])
      .select()
      .single()
    if (error) {
      console.error('addTrip error:', error)
      return error.message
    }
    setTrips(prev => [data as Trip, ...prev])
    return null
  }

  const updateTrip = async (id: string, formData: Partial<TripFormData>): Promise<string | null> => {
    const { data, error } = await supabase
      .from('trips')
      .update(formData)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('updateTrip error:', error)
      return error.message
    }
    setTrips(prev => prev.map(t => t.id === id ? data as Trip : t))
    return null
  }

  const deleteTrip = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) { console.error('deleteTrip error:', error); return false }
    setTrips(prev => prev.filter(t => t.id !== id))
    return true
  }

  const updateCoverImage = async (id: string, url: string): Promise<void> => {
    // Empty string means clear the cover image (set to null in DB)
    const value = url || null
    await supabase.from('trips').update({ cover_image_url: value }).eq('id', id)
    setTrips(prev => prev.map(t => t.id === id ? { ...t, cover_image_url: value ?? undefined } : t))
  }

  return { trips, loading, error, fetchTrips, addTrip, updateTrip, deleteTrip, updateCoverImage }
}
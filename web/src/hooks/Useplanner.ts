import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PlannedTrip, PlannedTripFormData, PlaceItem, BudgetItem, PackingItem, ItineraryDay } from '../types/planner'

export function usePlanner(userId: string | null) {
  const [plans, setPlans] = useState<PlannedTrip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('planned_trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setPlans(data as PlannedTrip[])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const createPlan = async (formData: PlannedTripFormData): Promise<string | null> => {
    const { data, error } = await supabase
      .from('planned_trips')
      .insert([{ ...formData, user_id: userId, itinerary: [], places: [], budget: [], packing: [] }])
      .select().single()
    if (error) return error.message
    setPlans(prev => [data as PlannedTrip, ...prev])
    return null
  }

  const updatePlan = async (id: string, updates: Partial<PlannedTrip>): Promise<string | null> => {
    const { data, error } = await supabase
      .from('planned_trips').update(updates).eq('id', id).select().single()
    if (error) return error.message
    setPlans(prev => prev.map(p => p.id === id ? data as PlannedTrip : p))
    return null
  }

  const deletePlan = async (id: string): Promise<void> => {
    await supabase.from('planned_trips').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  // Section-specific updaters
  const updatePlaces = async (id: string, places: PlaceItem[]) =>
    updatePlan(id, { places })

  const updateBudget = async (id: string, budget: BudgetItem[]) =>
    updatePlan(id, { budget })

  const updatePacking = async (id: string, packing: PackingItem[]) =>
    updatePlan(id, { packing })

  const updateItinerary = async (id: string, itinerary: ItineraryDay[]) =>
    updatePlan(id, { itinerary })

  const markCompleted = async (id: string): Promise<void> => {
    await updatePlan(id, { status: 'completed' })
  }

  return {
    plans, loading, fetchPlans,
    createPlan, updatePlan, deletePlan,
    updatePlaces, updateBudget, updatePacking, updateItinerary,
    markCompleted,
  }
}
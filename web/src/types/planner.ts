export type PlanStatus = 'planning' | 'completed'

export interface ItineraryDay {
  date: string
  activities: string[]
}

export interface BudgetItem {
  id: string
  category: string
  label: string
  estimated: number
  actual?: number
}

export interface PackingItem {
  id: string
  label: string
  packed: boolean
  category: string
}

export interface PlaceItem {
  id: string
  name: string
  type: 'sight' | 'restaurant' | 'activity' | 'other'
  notes?: string
  done: boolean
}

export interface PlannedTrip {
  id: string
  user_id: string
  title: string
  destination: string
  country: string
  start_date: string
  end_date: string
  status: PlanStatus
  cover_emoji: string
  notes: string
  itinerary: ItineraryDay[]
  places: PlaceItem[]
  budget: BudgetItem[]
  packing: PackingItem[]
  created_at: string
  updated_at: string
}

export interface PlannedTripFormData {
  title: string
  destination: string
  country: string
  start_date: string
  end_date: string
  cover_emoji: string
  notes: string
}
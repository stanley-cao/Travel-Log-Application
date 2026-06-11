import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars not set. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          country: string
          city: string
          latitude: number
          longitude: number
          start_date: string
          end_date: string
          rating: number
          cover_image_url: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
      trip_photos: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          url: string
          caption: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trip_photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trip_photos']['Insert']>
      }
    }
  }
}

export interface CityStop {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stops: CityStop[];
  start_date: string;
  end_date: string;
  rating: number;
  cover_image_url?: string | null;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TripPhoto {
  id: string;
  trip_id: string;
  user_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface TripFormData {
  title: string;
  stops: CityStop[];
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  rating: number;
  notes: string;
  tags: string[];
}

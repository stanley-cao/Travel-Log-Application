export interface Trip {
  id: string;
  user_id: string;
  title: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  rating: number; // 1-5
  cover_image_url?: string;
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
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  rating: number;
  notes: string;
  tags: string[];
}

export interface StatsData {
  totalTrips: number;
  totalCountries: number;
  totalCities: number;
  totalDays: number;
  topCountry: string;
  avgRating: number;
  tripsPerYear: { year: string; count: number }[];
  topTags: { tag: string; count: number }[];
  continentBreakdown: { continent: string; count: number }[];
}

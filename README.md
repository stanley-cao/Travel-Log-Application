# Travel Logger 

A beautiful, full-featured travel journaling and planning platform built with React, TypeScript, and Supabase.

## Features

### Trip Logging
- **Multi-city Trips** — Log trips across multiple cities, each with its own coordinates auto-detected via OpenStreetMap
- **Photo Uploads** — Upload and manage photos per trip, set a cover image, view in a lightbox; deleting the cover auto-promotes the next photo
- **Travel Journal** — Write detailed notes and memories for each trip
- **Ratings & Tags** — Rate each trip 1–5 stars and add multiple searchable tags with a multi-select dropdown
- **Search & Filter** — Full-text search across trips, cities, countries and tags; filter by country, year, and month

### Trip Planning
- **Day-by-day Itinerary** — Build a full daily schedule auto-generated from your trip dates
- **Places to See** — Add sights, restaurants, and activities; check them off as you visit
- **Budget Tracker** — Track estimated vs actual spend per category with running totals
- **Packing Checklist** — Organised by category (clothing, documents, electronics…) with a progress bar
- **Convert to Log** — One click marks a planned trip as completed and automatically adds it to your trip log

### Explore & Analyse
- **Interactive World Map** — Google Maps tiles in English with a pin for every city visited; switch between Map, Satellite, Hybrid, and Terrain views
- **Statistics Dashboard** — Trips-per-year bar chart, continent breakdown pie chart, top tags, and summary stats (countries, cities, days abroad)
- **Auth** — Email/password authentication via Supabase Auth with Row Level Security on all tables

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Map | Leaflet + React-Leaflet + Google Maps tiles |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + JSONB) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Geocoding | OpenStreetMap Nominatim (free, no key) |
| Date utils | date-fns |

---

## Project Structure

```
src/
├── components/
│   ├── AppLayout.tsx        # Sidebar nav wrapper
│   ├── StarRating.tsx       # Reusable star rating widget
│   ├── TagInput.tsx         # Multi-select tag dropdown with autocomplete
│   ├── TripCard.tsx         # Trip grid card (shows multi-city label)
│   └── TripForm.tsx         # Add/edit trip modal with multi-city stops
├── hooks/
│   ├── useAuth.ts           # Supabase auth state + session timeout
│   ├── useTrips.ts          # Trips CRUD with error surfacing
│   ├── usePhotos.ts         # Photo upload/delete + cover management
│   └── usePlanner.ts        # Planned trips CRUD + section updaters
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── stats.ts             # Statistics computation helpers
├── pages/
│   ├── AuthPage.tsx         # Login / signup with password reveal
│   ├── TripsPage.tsx        # Trip grid with search + country/year/month filters
│   ├── TripDetailPage.tsx   # Individual trip: journal, photos, multi-city header
│   ├── MapPage.tsx          # Google Maps world map with per-city pins
│   ├── StatsPage.tsx        # Analytics dashboard
│   ├── PlannerPage.tsx      # Planned trips list + new plan modal
│   └── PlanDetailPage.tsx   # Plan detail: itinerary, places, budget, packing
├── types/
│   ├── index.ts             # Trip, TripPhoto, CityStop, TripFormData interfaces
│   └── planner.ts           # PlannedTrip, PlaceItem, BudgetItem, PackingItem interfaces
├── App.tsx                  # Router + auth gate
├── main.tsx                 # Entry point
└── index.css                # Global design system (sand/terracotta/teal palette)
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd travel-logger
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project and wait for it to provision (~1 minute)

### 3. Run the Database Schema

1. In your Supabase project go to **SQL Editor → New query**
2. Open `supabase-schema.sql`, copy the entire contents, paste and click **Run**

This creates:
- `trips` table — multi-city stops stored as JSONB, full RLS policies
- `trip_photos` table — with RLS policies
- `planned_trips` table — itinerary, places, budget, packing all stored as JSONB
- Auto-update `updated_at` trigger on all tables

### 4. Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**, name it exactly: `trip-photos`
3. Enable **Public bucket** so photos are accessible via URL
4. Click **Save**

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in — use the **base URL only**, no trailing slash or `/rest/v1/`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find these in: **Supabase Dashboard → Project Settings → API**

### 6. Disable Email Confirmation (for local dev)

1. Go to **Authentication → Providers → Email**
2. Toggle off **Confirm email**
3. Click **Save**

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Usage

### Logging a Trip
1. Click **Log New Trip** on the Trips page
2. Add one or more city stops — click **+ Add City** for multi-city trips
3. Click **Auto-detect** on each stop to geocode coordinates automatically
4. Set dates, rating, tags, and journal notes
5. Click **Log Trip**

### Planning a Trip
1. Go to **Trip Planner** in the sidebar
2. Click **Plan New Trip**, choose an emoji, fill in destination and dates
3. Open the plan and use the four tabs:
   - **Itinerary** — add activities per day (auto-generated from your dates)
   - **Places** — add sights, restaurants, activities; check off as you visit
   - **Budget** — add expense items per category, fill in actual costs as you spend
   - **Packing** — build a checklist grouped by category, tick items off as you pack
4. When the trip is done, click **Done** — it marks the plan complete and adds it to your trip log automatically

### Adding Photos
1. Open any logged trip
2. Go to the **Photos** tab and click **Upload Photos**
3. The first photo auto-sets as the cover; click **Cover** on any photo to change it
4. Deleting the cover photo automatically promotes the next available photo
5. Click any photo to open the full lightbox view

### World Map
- Every city in every trip gets its own tilted pushpin
- Toggle between Map, Satellite, Hybrid, and Terrain views
- Click any pin for a popup with trip details and a direct link
- Stats legend in the bottom-left shows total trips, countries, and cities

### Filtering Trips
- Search by title, city, country, or tag
- Filter by country, year, and month independently
- Active filters show as removable chips; **Clear all** resets everything

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Vercel → Settings → Environment Variables**, then redeploy.

### Netlify

```bash
npm run build
# Deploy the dist/ folder via Netlify dashboard or CLI
```

Add the same two environment variables under **Site settings → Environment variables**.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `trips` | Logged trips with multi-city stops (JSONB), photos references, ratings, tags |
| `trip_photos` | Photos linked to trips, stored in Supabase Storage |
| `planned_trips` | Future trip plans with itinerary, places, budget, packing (all JSONB) |

All tables use **Row Level Security** — users can only read and write their own data.

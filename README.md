# Travel Logger 🌍

A beautiful, full-featured travel journaling platform built with React, TypeScript, and Supabase.

## Features

- 🗺️ **Interactive World Map** — See all your trips plotted on a Leaflet map with custom markers and popups
- 📸 **Photo Uploads** — Upload and manage photos per trip, set a cover image, and view in a lightbox
- 📓 **Travel Journal** — Write detailed notes and memories for each trip
- 📊 **Statistics Dashboard** — Bar charts, pie charts, and key stats about your travel history
- ⭐ **Ratings & Tags** — Rate each trip and add searchable tags
- 🔍 **Search & Filter** — Full-text search across trips, cities, countries and tags
- 🔐 **Auth** — Email/password authentication via Supabase Auth with Row Level Security

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Map | Leaflet + React-Leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Date utils | date-fns |

---

## Setup Instructions

### 1. Clone & Install

```bash
cd travel-logger
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish provisioning (~1 minute)

### 3. Run the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Open `supabase-schema.sql` from this project
3. Paste the entire contents and click **Run**

This creates:
- `trips` table with all trip fields + RLS policies
- `trip_photos` table with RLS policies
- Auto-update trigger for `updated_at`

### 4. Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it exactly: `trip-photos`
4. Check **Public bucket** (so photos are publicly readable via URL)
5. Click **Save**

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find these in: **Supabase Dashboard → Project Settings → API**

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Usage

### Logging a Trip
1. Click **Log New Trip** on the Trips page
2. Enter title, city, and country
3. Click **Auto-detect** to automatically geocode coordinates using OpenStreetMap
4. Set dates, rating, tags, and journal notes
5. Click **Log Trip**

### Adding Photos
1. Open any trip by clicking its card
2. Go to the **Photos** tab
3. Click **Upload Photos** or drag & drop
4. The first uploaded photo becomes the cover image
5. Click **Cover** on any photo to change the cover
6. Click any photo to open the lightbox

### World Map
- All logged trips appear as terracotta pins on the interactive map
- Click any pin to see a popup with trip details and a direct link
- Use scroll to zoom, drag to pan

### Statistics
- Automatically computed from all your trip data
- Updates in real-time as you add/edit trips
- Includes trips-per-year bar chart, continent pie chart, and top tags

---

## Project Structure

```
src/
├── components/
│   ├── AppLayout.tsx      # Sidebar nav wrapper
│   ├── StarRating.tsx     # Reusable star rating widget
│   ├── TagInput.tsx       # Chip-style tag input with autocomplete
│   ├── TripCard.tsx       # Trip grid card
│   └── TripForm.tsx       # Add/edit trip modal
├── hooks/
│   ├── useAuth.ts         # Supabase auth state
│   ├── useTrips.ts        # Trips CRUD
│   └── usePhotos.ts       # Photo upload/delete
├── lib/
│   ├── supabase.ts        # Supabase client + DB types
│   └── stats.ts           # Statistics computation
├── pages/
│   ├── AuthPage.tsx       # Login / signup
│   ├── TripsPage.tsx      # Trip grid with search/filter
│   ├── TripDetailPage.tsx # Individual trip + photos + journal
│   ├── MapPage.tsx        # Leaflet world map
│   └── StatsPage.tsx      # Analytics dashboard
├── types/
│   └── index.ts           # TypeScript interfaces
├── App.tsx                # Router + auth gate
├── main.tsx               # Entry point
└── index.css              # Global design system styles
```

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set the environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Netlify

```bash
npm run build
# Deploy the `dist/` folder
```

---

## Extending the App

Some ideas for future features:

- **Trip itinerary** — day-by-day schedule within a trip
- **Wishlist** — plan future destinations
- **Friends / sharing** — share trip logs publicly
- **Expense tracking** — log costs per trip
- **Export** — PDF or CSV export of trip data
- **Offline support** — PWA with service worker caching

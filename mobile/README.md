# Travel Logger — iOS App 📱

React Native + Expo mobile app with full feature parity with the web version.
Shares the same Supabase backend — all your web data is instantly available on mobile.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.74 |
| Tooling | Expo SDK 51 + Expo Router v3 |
| Navigation | Expo Router (file-based, like Next.js) |
| Map | react-native-maps (Google Maps) |
| Charts | react-native-chart-kit |
| Photos | expo-image-picker |
| Storage | expo-file-system + Supabase Storage |
| Auth storage | expo-secure-store (persists session securely) |
| Database | Supabase (same project as web app) |
| Icons | @expo/vector-icons (Ionicons) |

---

## Prerequisites

- Node.js 18+
- Xcode 15+ installed (for iOS simulator)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for device builds): `npm install -g eas-cli`

---

## Setup

### 1. Install dependencies

```bash
cd travel-logger-mobile
npm install
```

### 2. Add fonts

Download these 4 font files and place them in `assets/fonts/`:
- `PlayfairDisplay-Regular.ttf`
- `PlayfairDisplay-SemiBold.ttf`
- `DMSans-Regular.ttf`
- `DMSans-Medium.ttf`

Download from Google Fonts:
- https://fonts.google.com/specimen/Playfair+Display
- https://fonts.google.com/specimen/DM+Sans

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in — same Supabase project as your web app, just different prefix:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Add placeholder assets

Create an `assets/` folder and add:
- `icon.png` (1024×1024)
- `splash.png` (1284×2778)

You can use any image for now — replace with real assets later.

### 5. Run on iOS Simulator

```bash
npx expo start
# Press 'i' to open in iOS Simulator
```

### 6. Run on a real iPhone

```bash
# Install Expo Go from the App Store on your iPhone
npx expo start
# Scan the QR code with your iPhone camera
```

---

## Project Structure

```
app/
├── _layout.tsx              # Root layout — auth gate + font loading
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx            # Login / sign up screen
├── (tabs)/
│   ├── _layout.tsx          # Bottom tab bar
│   ├── trips.tsx            # Trips grid screen
│   ├── planner.tsx          # Trip planner list screen
│   ├── map.tsx              # Google Maps world map
│   └── stats.tsx            # Analytics dashboard
├── trip/
│   ├── new.tsx              # Add new trip form
│   └── [id].tsx             # Trip detail (journal, photos, edit)
└── plan/
    └── [id].tsx             # Plan detail (itinerary, places, budget, packing)

src/
├── constants/
│   └── theme.ts             # Colors, typography, spacing, shadows
├── hooks/
│   ├── useAuth.ts           # Supabase auth (identical logic to web)
│   ├── useTrips.ts          # Trips CRUD
│   ├── usePhotos.ts         # Photo upload via expo-file-system
│   └── usePlanner.ts        # Planned trips CRUD
├── lib/
│   ├── supabase.ts          # Supabase client with SecureStore session
│   └── stats.ts             # Stats computation (identical to web)
└── types/
    ├── index.ts             # Trip, CityStop, TripPhoto interfaces
    └── planner.ts           # PlannedTrip, PlaceItem, BudgetItem etc.
```

---

## Publishing to the App Store

### Step 1 — Create an Expo account
Sign up at https://expo.dev

### Step 2 — Configure EAS
```bash
eas build:configure
```

### Step 3 — Update app.json
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.travellogger"
    }
  }
}
```

### Step 4 — Build for iOS
```bash
eas build --platform ios
```
This uploads to Expo's build servers and produces a signed `.ipa`.

### Step 5 — Submit to App Store
```bash
eas submit --platform ios
```
You'll need an Apple Developer account ($99/year).

---

## Shared Supabase Backend

The mobile app uses the **exact same Supabase project** as the web app.
All tables, RLS policies, and storage buckets are already set up.
Just use the same URL and anon key — data syncs instantly between platforms.

---

## Adding Android Later

When you're ready to add Android:

1. Add to `app.json`:
```json
"android": {
  "package": "com.yourname.travellogger"
}
```

2. Switch map provider in `map.tsx`:
```tsx
// Already set to PROVIDER_GOOGLE — works on both platforms
// Android requires a Google Maps API key in app.json
```

3. Build:
```bash
eas build --platform android
```

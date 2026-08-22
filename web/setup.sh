#!/usr/bin/env bash
# Travel Logger — full folder scaffold + file placement
# Run this from the folder where you downloaded all the files:
#   bash setup.sh

set -e
ROOT="$(pwd)"

echo "📁 Creating folder structure..."
mkdir -p src/components src/hooks src/lib src/pages src/types

echo "📦 Moving files into correct locations..."

# Root-level files stay where they are
# (index.html, package.json, vite.config.ts, tsconfig*.json, .env.example, README.md already correct)

# src/ root
for f in App.tsx main.tsx index.css; do
  [ -f "$f" ] && mv "$f" src/ && echo "  moved $f → src/$f"
done

# src/components
for f in AppLayout.tsx StarRating.tsx TagInput.tsx TripCard.tsx TripForm.tsx; do
  [ -f "$f" ] && mv "$f" src/components/ && echo "  moved $f → src/components/$f"
done

# src/hooks
for f in useAuth.ts useTrips.ts usePhotos.ts; do
  [ -f "$f" ] && mv "$f" src/hooks/ && echo "  moved $f → src/hooks/$f"
done

# src/lib
for f in supabase.ts stats.ts; do
  [ -f "$f" ] && mv "$f" src/lib/ && echo "  moved $f → src/lib/$f"
done

# src/pages
for f in AuthPage.tsx TripsPage.tsx MapPage.tsx StatsPage.tsx TripDetailPage.tsx; do
  [ -f "$f" ] && mv "$f" src/pages/ && echo "  moved $f → src/pages/$f"
done

# src/types
for f in index.ts; do
  # only move index.ts if it's the types file (check content)
  if [ -f "$f" ] && grep -q "TripPhoto" "$f" 2>/dev/null; then
    mv "$f" src/types/ && echo "  moved $f → src/types/$f"
  fi
done

echo ""
echo "✅ Done! Your structure should now look like:"
find . -not -path './node_modules/*' -not -path './.git/*' -type f | sort


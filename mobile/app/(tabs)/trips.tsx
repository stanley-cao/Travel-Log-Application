import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Alert
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO, differenceInDays, getYear } from 'date-fns'
import { Colors, Spacing, Radius, Shadow, Typography } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import { Trip } from '@/types'

export default function TripsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { trips, loading } = useTrips(user?.id ?? null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return trips
    const q = search.toLowerCase()
    return trips.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    )
  }, [trips, search])

  const renderTrip = ({ item }: { item: Trip }) => {
    const nights = Math.max(1, differenceInDays(parseISO(item.end_date), parseISO(item.start_date)) + 1)
    const cityLabel = item.stops?.length > 1
      ? `${item.stops[0].city} +${item.stops.length - 1} more`
      : `${item.city}, ${item.country}`

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/trip/${item.id}`)}
        activeOpacity={0.85}
      >
        {/* Cover */}
        <View style={styles.cardCover}>
          {item.cover_image_url
            ? <Image source={{ uri: item.cover_image_url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            : <View style={styles.coverPlaceholder}><Text style={styles.coverEmoji}>🌍</Text></View>
          }
          <View style={styles.daysBadge}>
            <Text style={styles.daysBadgeText}>{nights}d</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={12} color={Colors.sand500} />
            <Text style={styles.cardMetaText}>{cityLabel}</Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.sand500} />
              <Text style={styles.cardMetaText}>{format(parseISO(item.start_date), 'MMM yyyy')}</Text>
            </View>
            <Text style={styles.stars}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
          </View>
          {item.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map(tag => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Trips</Text>
          <Text style={styles.headerSub}>{trips.length} adventures logged</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(v => !v)}>
            <Ionicons name="search-outline" size={22} color={Colors.sand700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/trip/new')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.sand400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips, cities, tags…"
            placeholderTextColor={Colors.sand400}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.sand400} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.terracotta} size="large" /></View>
      ) : trips.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🌍</Text>
          <Text style={styles.emptyTitle}>No trips logged yet</Text>
          <Text style={styles.emptySub}>Start documenting your adventures.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/trip/new')}>
            <Text style={styles.addBtnText}>+ Log First Trip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderTrip}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingTop: 60, paddingBottom: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.sand200,
  },
  headerTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 24, color: Colors.sand900 },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.sand500, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 6 },
  addBtn: {
    backgroundColor: Colors.terracotta, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  addBtnText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, margin: Spacing.lg,
    borderWidth: 1, borderColor: Colors.sand200, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 15, color: Colors.sand900 },
  list: { padding: Spacing.lg },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.sm,
  },
  cardCover: { height: 130, backgroundColor: Colors.sand100, position: 'relative' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.tealLight },
  coverEmoji: { fontSize: 36 },
  daysBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  daysBadgeText: { fontFamily: 'DMSans-Medium', fontSize: 11, color: Colors.sand900 },
  cardBody: { padding: 12 },
  cardTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 15, color: Colors.sand900, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  cardMetaText: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.sand500 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { fontSize: 12, color: Colors.gold, letterSpacing: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tag: { backgroundColor: Colors.sand100, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.sand700 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 20, color: Colors.sand700, marginBottom: 8 },
  emptySub: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.sand500, marginBottom: 24 },
})

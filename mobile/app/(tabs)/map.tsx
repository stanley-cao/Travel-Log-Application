import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import { useRouter } from 'expo-router'
import { format, parseISO } from 'date-fns'
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'

const { width } = Dimensions.get('window')

export default function MapScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { trips, loading } = useTrips(user?.id ?? null)

  const allStops = trips.flatMap(trip => {
    const stops = trip.stops?.length
      ? trip.stops
      : [{ city: trip.city, country: trip.country, latitude: trip.latitude, longitude: trip.longitude }]
    return stops
      .filter(s => s.latitude !== 0 || s.longitude !== 0)
      .map(stop => ({ stop, trip }))
  })

  const countryCount = new Set(trips.map(t => t.country)).size
  const cityCount = new Set(trips.map(t => t.city)).size

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>World Map</Text>
        <Text style={styles.headerSub}>
          {trips.length} trips · {countryCount} countries · {cityCount} cities
        </Text>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
        showsUserLocation={true}
        showsCompass={true}
      >
        {allStops.map(({ stop, trip }, idx) => (
          <Marker
            key={`${trip.id}-${idx}`}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            pinColor={Colors.terracotta}
          >
            <Callout onPress={() => router.push(`/trip/${trip.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{trip.title}</Text>
                <Text style={styles.calloutSub}>📍 {stop.city}, {stop.country}</Text>
                <Text style={styles.calloutSub}>
                  📅 {format(parseISO(trip.start_date), 'MMM d')} – {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                </Text>
                <Text style={styles.calloutStars}>
                  {'★'.repeat(trip.rating)}{'☆'.repeat(5 - trip.rating)}
                </Text>
                <Text style={styles.calloutLink}>View Trip →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Stats legend */}
      {trips.length > 0 && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Your Travels</Text>
          <Text style={styles.legendItem}>🗺️ {trips.length} trips</Text>
          <Text style={styles.legendItem}>🌍 {countryCount} countries</Text>
          <Text style={styles.legendItem}>🏙️ {cityCount} cities</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingTop: 60, paddingBottom: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.sand200,
  },
  headerTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 24, color: Colors.sand900 },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.sand500, marginTop: 2 },
  map: { flex: 1 },
  callout: { width: 200, padding: 8 },
  calloutTitle: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.sand900, marginBottom: 4 },
  calloutSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.sand500, marginBottom: 2 },
  calloutStars: { color: Colors.gold, fontSize: 14, marginVertical: 4 },
  calloutLink: { color: Colors.terracotta, fontFamily: 'DMSans-Medium', fontSize: 13, marginTop: 4 },
  legend: {
    position: 'absolute', bottom: 32, left: 16,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.md,
  },
  legendTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 14, color: Colors.sand900, marginBottom: 6 },
  legendItem: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.sand700, marginBottom: 2 },
})

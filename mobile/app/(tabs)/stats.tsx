import { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { BarChart, PieChart } from 'react-native-chart-kit'
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import { computeStats } from '@/lib/stats'

const { width } = Dimensions.get('window')
const chartWidth = width - Spacing.xl * 2

const chartConfig = {
  backgroundColor: Colors.white,
  backgroundGradientFrom: Colors.white,
  backgroundGradientTo: Colors.white,
  color: (opacity = 1) => `rgba(196, 98, 58, ${opacity})`,
  labelColor: () => Colors.sand500,
  barPercentage: 0.6,
  decimalPlaces: 0,
}

const PIE_COLORS = ['#C4623A', '#2A7A6E', '#C49A2A', '#7F77DD', '#D85A30', '#1D9E75']

export default function StatsScreen() {
  const { user } = useAuth()
  const { trips } = useTrips(user?.id ?? null)
  const stats = useMemo(() => computeStats(trips), [trips])

  if (trips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySub}>Log some trips to see your travel stats.</Text>
        </View>
      </View>
    )
  }

  const STAT_CARDS = [
    { label: 'Total Trips', value: stats.totalTrips },
    { label: 'Countries', value: stats.totalCountries },
    { label: 'Cities', value: stats.totalCities },
    { label: 'Days Abroad', value: stats.totalDays },
    { label: 'Avg Rating', value: stats.avgRating },
    { label: 'Top Country', value: stats.topCountry, small: true },
  ]

  const barData = {
    labels: stats.tripsPerYear.map(t => t.year.slice(2)),
    datasets: [{ data: stats.tripsPerYear.map(t => t.count) }],
  }

  const pieData = stats.continentBreakdown.map((c, i) => ({
    name: c.continent,
    population: c.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
    legendFontColor: Colors.sand700,
    legendFontSize: 12,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSub}>Your travel at a glance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stat cards */}
        <View style={styles.grid}>
          {STAT_CARDS.map(({ label, value, small }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, small && { fontSize: 18 }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        {stats.tripsPerYear.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Trips per Year</Text>
            <BarChart
              data={barData}
              width={chartWidth - Spacing.xl * 2}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          </View>
        )}

        {/* Pie chart */}
        {stats.continentBreakdown.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>By Continent</Text>
            <PieChart
              data={pieData}
              width={chartWidth - Spacing.xl * 2}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              style={styles.chart}
            />
          </View>
        )}

        {/* Top tags */}
        {stats.topTags.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Most Used Tags</Text>
            <View style={styles.tagsWrap}>
              {stats.topTags.map(({ tag, count }) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                  <View style={styles.tagCount}>
                    <Text style={styles.tagCountText}>{count}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand50 },
  header: {
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingTop: 60, paddingBottom: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.sand200,
  },
  headerTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 24, color: Colors.sand900 },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.sand500, marginTop: 2 },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.white,
    borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm,
  },
  statLabel: { fontFamily: 'DMSans-Medium', fontSize: 11, color: Colors.sand500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 28, color: Colors.sand900 },
  chartCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.sm,
  },
  chartTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 17, color: Colors.sand900, marginBottom: 16 },
  chart: { borderRadius: Radius.md },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.sand50, borderWidth: 1, borderColor: Colors.sand200,
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6,
  },
  tagPillText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.sand900 },
  tagCount: { backgroundColor: Colors.terracotta, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1 },
  tagCountText: { fontFamily: 'DMSans-Medium', fontSize: 11, color: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 20, color: Colors.sand700, marginBottom: 8 },
  emptySub: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.sand500 },
})

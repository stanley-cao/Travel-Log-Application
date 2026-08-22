import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { usePlanner } from '@/hooks/usePlanner'
import { PlannedTrip } from '@/types/planner'

const EMOJIS = ['✈️','🏖️','🏔️','🗺️','🌍','🎒','🏛️','🌴','🗼','🏯','🌋','🚢','🏕️','🎡','🌸']

export default function PlannerScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { plans, loading, createPlan, deletePlan, markCompleted } = usePlanner(user?.id ?? null)
  const [tab, setTab] = useState<'planning' | 'completed'>('planning')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', destination: '', country: '',
    start_date: '', end_date: '', cover_emoji: '✈️', notes: ''
  })

  const filtered = plans.filter(p => p.status === tab)

  const handleCreate = async () => {
    if (!form.title) { Alert.alert('Please add a trip title'); return }
    setSaving(true)
    await createPlan(form)
    setSaving(false)
    setShowModal(false)
    setForm({ title: '', destination: '', country: '', start_date: '', end_date: '', cover_emoji: '✈️', notes: '' })
  }

  const handleMarkDone = async (plan: PlannedTrip) => {
    Alert.alert('Mark as completed?', `This will mark "${plan.title}" as done.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Done', onPress: () => markCompleted(plan.id) }
    ])
  }

  const handleDelete = (plan: PlannedTrip) => {
    Alert.alert('Delete plan?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(plan.id) }
    ])
  }

  const renderPlan = ({ item }: { item: PlannedTrip }) => {
    const days = item.start_date && item.end_date
      ? Math.max(1, differenceInDays(parseISO(item.end_date), parseISO(item.start_date)) + 1)
      : null
    const daysUntil = item.start_date ? differenceInDays(parseISO(item.start_date), new Date()) : null

    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => router.push(`/plan/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.planEmoji}>
          <Text style={{ fontSize: 28 }}>{item.cover_emoji}</Text>
        </View>
        <View style={styles.planBody}>
          <View style={styles.planTitleRow}>
            <Text style={styles.planTitle} numberOfLines={1}>{item.title}</Text>
            {daysUntil !== null && daysUntil >= 0 && item.status === 'planning' && (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{daysUntil === 0 ? 'Today!' : `${daysUntil}d`}</Text>
              </View>
            )}
          </View>
          {item.destination ? (
            <Text style={styles.planSub}>📍 {item.destination}{item.country ? `, ${item.country}` : ''}</Text>
          ) : null}
          {item.start_date ? (
            <Text style={styles.planSub}>
              📅 {format(parseISO(item.start_date), 'MMM d')}{item.end_date ? ` – ${format(parseISO(item.end_date), 'MMM d, yyyy')}` : ''}
              {days ? ` · ${days}d` : ''}
            </Text>
          ) : null}
          <View style={styles.progressRow}>
            {item.places?.length > 0 && <View style={styles.pill}><Text style={styles.pillText}>{item.places.filter(p=>p.done).length}/{item.places.length} places</Text></View>}
            {item.packing?.length > 0 && <View style={styles.pill}><Text style={styles.pillText}>{item.packing.filter(p=>p.packed).length}/{item.packing.length} packed</Text></View>}
            {item.budget?.reduce((s,b)=>s+b.estimated,0) > 0 && <View style={styles.pill}><Text style={styles.pillText}>${item.budget.reduce((s,b)=>s+b.estimated,0).toLocaleString()}</Text></View>}
          </View>
        </View>
        <View style={styles.planActions}>
          {item.status === 'planning' && (
            <TouchableOpacity onPress={() => handleMarkDone(item)} style={styles.doneBtn}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.teal} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={Colors.sand300} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={16} color={Colors.sand300} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Trip Planner</Text>
          <Text style={styles.headerSub}>{plans.filter(p=>p.status==='planning').length} upcoming trips</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['planning', 'completed'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'planning' ? `Upcoming (${plans.filter(p=>p.status==='planning').length})` : `Completed (${plans.filter(p=>p.status==='completed').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.terracotta} size="large" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>{tab === 'planning' ? '🗺️' : '✅'}</Text>
          <Text style={styles.emptyTitle}>{tab === 'planning' ? 'No trips planned' : 'No completed plans'}</Text>
          {tab === 'planning' && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={{ color: Colors.white, fontFamily: 'DMSans-Medium', fontSize: 14 }}>+ Plan New Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderPlan}
          contentContainerStyle={{ padding: Spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* New Plan Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Plan New Trip</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.sand700} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Cover Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
              <View style={styles.emojiRow}>
                {EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => setForm(f=>({...f, cover_emoji: e}))}
                    style={[styles.emojiBtn, form.cover_emoji === e && styles.emojiBtnActive]}>
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Trip Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Japan Spring 2026"
              value={form.title} onChangeText={v => setForm(f=>({...f, title: v}))} />

            <Text style={styles.label}>City / Region</Text>
            <TextInput style={styles.input} placeholder="e.g. Tokyo"
              value={form.destination} onChangeText={v => setForm(f=>({...f, destination: v}))} />

            <Text style={styles.label}>Country</Text>
            <TextInput style={styles.input} placeholder="e.g. Japan"
              value={form.country} onChangeText={v => setForm(f=>({...f, country: v}))} />

            <Text style={styles.label}>Notes / Goals</Text>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="What do you want to do?"
              multiline value={form.notes} onChangeText={v => setForm(f=>({...f, notes: v}))} />

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.createBtnText}>Create Plan</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  addBtn: { backgroundColor: Colors.terracotta, borderRadius: Radius.md, padding: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.sand200 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Colors.terracotta },
  tabText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.sand500 },
  tabTextActive: { fontFamily: 'DMSans-Medium', color: Colors.terracotta },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm,
  },
  planEmoji: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.sand100, alignItems: 'center', justifyContent: 'center' },
  planBody: { flex: 1 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  planTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 16, color: Colors.sand900, flex: 1 },
  countdownBadge: { backgroundColor: Colors.goldLight, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  countdownText: { fontFamily: 'DMSans-Medium', fontSize: 11, color: '#7A5800' },
  planSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.sand500, marginBottom: 2 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  pill: { backgroundColor: Colors.sand100, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.sand700 },
  planActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 20, color: Colors.sand700, marginBottom: 16 },
  modal: { flex: 1, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: Colors.sand200 },
  modalTitle: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 22, color: Colors.sand900 },
  modalBody: { padding: Spacing.xl, paddingBottom: 60 },
  label: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.sand700, marginBottom: 6, marginTop: Spacing.md },
  input: { borderWidth: 1, borderColor: Colors.sand200, borderRadius: Radius.md, padding: Spacing.md, fontFamily: 'DMSans-Regular', fontSize: 15, color: Colors.sand900, marginBottom: 4 },
  emojiRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: Colors.sand200, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  emojiBtnActive: { borderColor: Colors.terracotta, backgroundColor: Colors.terracottaLight },
  createBtn: { backgroundColor: Colors.terracotta, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl },
  createBtnText: { fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.white },
})

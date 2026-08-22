import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.terracotta} />
      </View>
    )
  }

  return <Redirect href={user ? '/trips' : '/login'} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sand900,
  },
})
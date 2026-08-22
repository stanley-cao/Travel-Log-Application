import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuth } from '@/hooks/useAuth'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-SemiBold': require('../assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
  })

  useEffect(() => {
    if (!loading && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync()
    }
  }, [loading, fontsLoaded, fontError])

  useEffect(() => {
    if (loading) return
    if (!fontsLoaded && !fontError) return

    const inAuthGroup = segments[0] === '(auth)'

    console.log('Auth state:', { user: !!user, inAuthGroup, segments })

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/trips')
    }
  }, [user, loading, fontsLoaded, fontError, segments])

  if (loading || (!fontsLoaded && !fontError)) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="plan/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Radius, Typography } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert('Please fill in all fields'); return }
    setLoading(true)
    if (mode === 'signin') {
      const err = await signIn(email, password)
      if (err) Alert.alert('Sign in failed', err.message)
    } else {
      const err = await signUp(email, password)
      if (err) Alert.alert('Sign up failed', err.message)
      else Alert.alert('Account created!', 'You can now sign in.')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="globe-outline" size={32} color={Colors.terracotta} />
          </View>
          <Text style={styles.appName}>Travel Logger</Text>
          <Text style={styles.subtitle}>
            {mode === 'signin' ? 'Welcome back, explorer' : 'Start your travel journal'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.sand400}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={Colors.sand400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={Colors.sand400} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(m => m === 'signin' ? 'signup' : 'signin')} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: Colors.terracotta, fontFamily: 'DMSans-Medium' }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand900 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  appName: {
    fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 28,
    color: Colors.white, marginBottom: Spacing.xs,
  },
  subtitle: { fontFamily: 'DMSans-Regular', fontSize: 15, color: Colors.sand300 },
  form: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  label: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.sand700, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.sand200, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: 15, fontFamily: 'DMSans-Regular', color: Colors.sand900,
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.sand200, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  eyeBtn: { padding: 4 },
  primaryBtn: {
    backgroundColor: Colors.terracotta, borderRadius: Radius.md,
    padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl,
  },
  primaryBtnText: { fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.white },
  switchBtn: { marginTop: Spacing.xl, alignItems: 'center' },
  switchText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.sand500 },
})
